import React, {useState, Fragment, useContext, useEffect} from 'react'
import ReadOnlyRow from './ReadOnlyRow'
import EditableRow from './EditableRow'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Box from '@mui/material/Box'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableFooter from '@mui/material/TableFooter'
import TablePagination from '@mui/material/TablePagination'
import {TableContainer} from '@mui/material'
import {Button, Divider, Paper} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import InputBase from '@mui/material/InputBase'
import {useTheme} from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  getListRoomApi,
  postRoomApi,
  putRoomApi,
} from '../../services/fetchDataApi'
import UseCookie from '../../context/auth/UseCookie'
import AddDialog from './AddDialog'
import {makeStyles} from '@material-ui/core'
import {ResourcesContext} from '../../context/resources/resourcesContext'
import {toast} from 'react-toastify'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

const useStyles = makeStyles((theme) => ({
  table: {
    userSelect: 'none',
    '& thead th': {
      fontWeight: '600',
    },
    '& tbody td': {
      fontWeight: '300',
    },
    '& tbody tr:nth-child(even)': {
      backgroundColor: '#f1f1f1',
      color: '#333',
    },
    // '& thead th:nth-child(2) svg:first-child': {
    // 	opacity: 0
    // },
    // '& thead th:nth-child(2):hover svg:f': {
    // 	opacity: 1
    // },
    boxShadow:
      'rgb(0 0 0 / 20%) 0px 3px 1px -2px, rgb(0 0 0 / 14%) 0px 2px 2px 0px, rgb(0 0 0 / 12%) 0px 1px 5px 0px',
  },
}))

function TablePaginationActions(props) {
  const theme = useTheme()
  const {count, page, rowsPerPage, onPageChange} = props

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0)
  }

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1)
  }

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1)
  }

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
  }

  return (
    <Box sx={{flexShrink: 0, ml: 2.5}}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label='first page'
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label='previous page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='next page'
      >
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='last page'
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
      <IconButton onClick={() => window.location.reload(false)}>
        <RefreshIcon />
      </IconButton>
    </Box>
  )
}

const numberRegex = /^([1-9][0-9]{0,2}|1000)$/
const room_regex =
  /^[A-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễếệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ' ']{2,20}$/
function ManageRoomsPage() {
  const classes = useStyles()
  const [searchValue, setSearchValue] = useState()
  const {cookies} = UseCookie()
  const [page, setPage] = useState(0)
  const [color, setColor] = useState('')
  const [overText, setOverText] = useState(false)
  const [overSize, setOverSize] = useState(false)

  console.log(color)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [nameValidate, setNameValidate] = useState(true)
  const [sizeValidate, setSizeValidate] = useState(true)
  const [colorValidate, setColorValidate] = useState(true)
  const [open, setOpen] = useState(false)
  const [sortName, setSortName] = useState(false)
  const [sortSize, setSortSize] = useState(false)

  const [realRoom, setRealRoom] = useState('')

  const [addFormData, setAddFormData] = useState({
    name: '',
    size: '',
    color: '',
    peripheral: false,
    roomVip: false,
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    size: '',
    color: '',
    peripheral: '',
    roomVip: '',
  })

  const {resources, resourcesDispatch} = useContext(ResourcesContext)
  const rooms = resources[0].instances

  const numberBool = numberRegex.test(addFormData.size)
  const roomBool = room_regex.test(addFormData.name)

  const numberEditBool = numberRegex.test(editFormData.size)
  const roomEditBool = room_regex.test(editFormData.name)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleSort = (name) => {
    if (name === 'text' && !sortName) {
      return [...rooms].sort((a, b) => a[name].localeCompare(b[name]))
    } else if (name === 'text' && sortName) {
      return [...rooms].sort((a, b) => b[name].localeCompare(a[name]))
    } else if (name === 'size' && sortSize) {
      return [...rooms].sort((a, b) => a[name] - b[name])
    } else {
      return [...rooms].sort((a, b) => b[name] - a[name])
    }
  }
  const realData = realRoom ? handleSort(realRoom) : rooms
  const sortedSearch = searchValue
    ? realData.filter((room) =>
        room.text.toLowerCase().includes(searchValue.toLowerCase())
      )
    : realData

  console.log(realData)

  const handleChangeComplete = (color) => {
    if (color) {
      setColorValidate(true)
    }
    setColor(color.hex)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleClose = () => {
    setNameValidate(true)
    setSizeValidate(true)
    setColorValidate(true)
    setAddFormData({
      ...addFormData,
      name: '',
      size: '',
    })
    setOpen(false)
  }
  const [editRoomId, setEditRoomId] = useState(null)

  const handleAddFormChange = (event) => {
    event.preventDefault()

    const fieldName = event.target.getAttribute('name')
    const fieldValue =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value

    const newFormData = {...addFormData}
    newFormData[fieldName] = fieldValue
    console.log(event)
    setAddFormData(newFormData)
  }

  const handleEditFormChange = (event) => {
    event.preventDefault()

    const fieldName = event.target?.getAttribute('name')
    const fieldValue = event.target.value

    const newFormData = {...editFormData}
    newFormData[fieldName] = fieldValue
    console.log(event)
    setEditFormData(newFormData)
  }

  const handleEditSelectFormChange = (event, type) => {
    event.preventDefault()
    const fieldValue = event.target.value

    const newFormData = {...editFormData}
    newFormData[type] = fieldValue
    console.log(event)
    setEditFormData(newFormData)
  }

  const checkValidation = () => {
    setSizeValidate(numberBool)
    setNameValidate(roomBool)
    setColorValidate(color)
    return !numberBool || !roomBool || !color
  }

  const handleAddFormSubmit = async (event) => {
    event.preventDefault()
    if (checkValidation()) return
    const newRoom = {
      name: addFormData.name,
      size: addFormData.size,
      color: color,
      is_peripheral: addFormData.peripheral,
      is_vip: addFormData.roomVip,
    }
    console.log(newRoom)
    try {
      const res = await postRoomApi(
        'add_room',
        cookies?.auth?.access_token,
        newRoom
      )
      if (res.status === 500) {
        toast.error('Internal server error')
        return
      }
      const data = await res.json()
      if (data.success) {
        const res = await getListRoomApi(cookies?.auth?.access_token)
        const event = await res.json()
        const findOne = event.data.find(
          (item) => item.name === addFormData.name
        )
        const newLocation = {
          roomVip: findOne.is_vip,
          id: findOne.id,
          text: findOne.name,
          peripheral: findOne.is_peripheral,
          ...newRoom,
        }
        resourcesDispatch({
          type: 'ADD_LOCATION',
          newLocation,
        })
        toast.success(`${newLocation.text} added`)
        setOpen(false)
        setAddFormData({
          ...addFormData,
          name: '',
          size: '',
        })
      } else {
        toast.error(data.error.message)
      }
    } catch {
      toast.error('Network connection error')
    }
  }

  const handleEditFormSubmit = async (event) => {
    event.preventDefault()
    setSizeValidate(numberEditBool)
    setNameValidate(roomEditBool)
    if (!numberEditBool || !roomEditBool) return
    const colorfind = rooms.find((room) => room.id === editRoomId)
    const editedData = {
      name: editFormData.name,
      size: editFormData.size,
      color: color === '' ? colorfind.color : color,
      is_peripheral: editFormData.peripheral,
      is_vip: editFormData.roomVip,
    }
    try {
      const res = await putRoomApi(
        editRoomId,
        cookies?.auth?.access_token,
        editedData
      )
      if (res.status === 500) {
        toast.error('Internal server error')
      } else if (res.status === 400) {
        toast.error('Room is invalid')
      } else {
        const data = await res.json()
        if (!data.hasOwnProperty('success')) {
          const editedRoom = {
            id: editRoomId,
            text: editFormData.name,
            size: editFormData.size,
            color: color === '' ? colorfind.color : color,
            peripheral: editFormData.peripheral,
            roomVip: editFormData.roomVip,
          }

          resourcesDispatch({
            type: 'EDIT_LOCATION',
            id: editRoomId,
            data: editedRoom,
          })
          setEditRoomId(null)
          setColor('')
          toast.success('edited !')
        } else {
          toast.error(data.error.message)
        }
      }
    } catch {
      toast.error('Network connection error')
    }
  }

  const handleEditClick = (event, room) => {
    event.preventDefault()
    setEditRoomId(room.id)
    setSizeValidate(true)
    setNameValidate(true)
    const formValues = {
      name: room.text,
      size: room.size,
      color: room.color,
      peripheral: room.peripheral,
      roomVip: room.roomVip,
    }

    setEditFormData(formValues)
  }

  const handleCancelClick = () => {
    setEditRoomId(null)
    setColor('')
  }

  const handleDeleteClick = async (roomId, id) => {
    const deleteRoom = {
      name: roomId,
    }
    console.log(roomId)
    try {
      const res = await postRoomApi(
        'delete_room',
        cookies?.auth?.access_token,
        deleteRoom
      )
      if (res.status === 500) {
        toast.error('internal server error!')
      } else {
        resourcesDispatch({
          type: 'DELETE_LOCATION',
          id: id,
        })
        toast.success('deleted successfully!')
      }
    } catch {
      toast.error('Network connection error')
    }
  }

  const handleSearchClick = ({searchValue, rooms}) => {
    console.log(rooms)
    // const result = rooms.find(({ text }) => text === searchValue)
    // popupDispatch({
    // 	type: 'OPEN',
    // 	text: result.text
    // })
  }
  const sortSet = {
    size: [setSortSize, sortSize, overSize],
    text: [setSortName, sortName, overText],
  }
  const handleSortValue = (prop) => {
    return () => {
      if (prop === 'size') {
        setSortName(false)
      } else {
        setSortSize(false)
      }
      setRealRoom(prop)
      if (realRoom !== prop) {
        sortSet[prop][0](false)
        return
      }
      sortSet[prop][0](!sortSet[prop][1])
    }
  }
  const showHoverArrow = (prop) => {
    if (sortSet[prop][2] && !sortSet[prop][1]) {
      return (
        <ArrowUpwardIcon
          sx={{position: 'absolute', fontSize: '1rem', right: '-20px'}}
        />
      )
    } else if (sortSet[prop][2] && sortSet[prop][1]) {
      return (
        <ArrowDownwardIcon
          sx={{position: 'absolute', fontSize: '1rem', right: '-20px'}}
        />
      )
    } else {
      return null
    }
  }

  const showArrow = (prop) => {
    if (realRoom === prop && !sortSet[prop][1]) {
      return (
        <ArrowUpwardIcon
          sx={{position: 'absolute', fontSize: '1rem', right: '-20px'}}
        />
      )
    } else if (realRoom === prop && sortSet[prop][1]) {
      return (
        <ArrowDownwardIcon
          sx={{position: 'absolute', fontSize: '1rem', right: '-20px'}}
        />
      )
    } else {
      return null
    }
  }
  return (
    <Paper className='app-container' sx={{marginTop: '1rem'}}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          // padding: "1rem",
          padding: '1rem',
        }}
      >
        <AddDialog
          handleAddFormChange={handleAddFormChange}
          handleAddFormSubmit={handleAddFormSubmit}
          color={color}
          setColor={setColor}
          handleChangeComplete={handleChangeComplete}
          addFormData={addFormData}
          open={open}
          setOpen={setOpen}
          setSizeValidate={setSizeValidate}
          sizeValidate={sizeValidate}
          nameValidate={nameValidate}
          setNameValidate={setNameValidate}
          colorValidate={colorValidate}
          handleClose={handleClose}
          setAddFormData={setAddFormData}
          setEditRoomId={setEditRoomId}
        />
        <Paper>
          <InputBase
            sx={{ml: 1, flex: 1}}
            placeholder='Search '
            inputProps={{'aria-label': 'search google maps'}}
            variant='outlined'
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value)
            }}
          />
          <Button
            sx={{p: '10px'}}
            aria-label='search'
            onClick={handleSearchClick({rooms, searchValue})}
          >
            <SearchIcon />
          </Button>
        </Paper>
      </Box>
      <Divider />
      <Box>
        <form onSubmit={handleEditFormSubmit}>
          <TableContainer sx={{maxHeight: '70vh'}}>
            <Table stickyHeader className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell
                    onClick={handleSortValue('text')}
                    onMouseOver={() => setOverText(true)}
                    onMouseOut={() => setOverText(false)}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      <div>Name</div>
                      {showHoverArrow('text')}
                      {showArrow('text')}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={handleSortValue('size')}
                    onMouseOver={() => setOverSize(true)}
                    onMouseOut={() => setOverSize(false)}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      <div>Room Size</div>
                      {showHoverArrow('size')}
                      {showArrow('size')}
                    </Box>
                  </TableCell>
                  <TableCell>Room Color</TableCell>
                  <TableCell>Peripheral</TableCell>
                  <TableCell>Room Vip</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? sortedSearch.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : sortedSearch
                ).map((room) => (
                  <Fragment key={room.id}>
                    {editRoomId === room.id ? (
                      <EditableRow
                        editFormData={editFormData}
                        handleEditFormChange={handleEditFormChange}
                        handleCancelClick={handleCancelClick}
                        handleChangeComplete={handleChangeComplete}
                        handleEditSelectFormChange={handleEditSelectFormChange}
                        color={color}
                        setNameValidate={setNameValidate}
                        setEditFormData={setEditFormData}
                        nameValidate={nameValidate}
                        setSizeValidate={setSizeValidate}
                        sizeValidate={sizeValidate}
                      />
                    ) : (
                      <ReadOnlyRow
                        room={room}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                      />
                    )}
                  </Fragment>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[
                      2,
                      5,
                      10,
                      25,
                      {label: 'All', value: -1},
                    ]}
                    count={rooms.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </form>
      </Box>
    </Paper>
  )
}

export default ManageRoomsPage
