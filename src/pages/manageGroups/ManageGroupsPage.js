import {
  Button,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TablePagination,
  Divider,
  TableContainer,
} from '@mui/material'
import {Fragment, useState, useEffect} from 'react'
import {toast, ToastContainer} from 'react-toastify'
import AddDialog from './AddDialog'
import EditableRow from './EditableRow'
import UseCookie from './../../context/auth/UseCookie'
import {
  getDataApi,
  postDataApi,
  putDataApi,
} from './../../services/fetchDataApi'
import ReadOnlyRow from './ReadOnlyRow'
import {useTheme} from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import IconButton from '@mui/material/IconButton'
import FirstPageIcon from '@mui/icons-material/FirstPage'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import LastPageIcon from '@mui/icons-material/LastPage'

const TablePaginationActions = (props) => {
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
    <Box sx={{flexShrink: 0, ml: 2.5, float: 'left'}}>
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

const ManageGroupsPage = () => {
  const {cookies} = UseCookie()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [groupName, setGroupName] = useState('')
  const [editGroupName, setEditGroupName] = useState('')

  const [editGroupNameId, setEditGroupNameId] = useState(null)

  const [open, setOpen] = useState(false)

  const data = {
    groupName,
    setGroupName,
  }

  useEffect(() => {
    const getGroups = async () => {
      try {
        setLoading(true)
        const res = await getDataApi(
          'groups/listgroup/',
          cookies?.auth?.access_token
        )
        const data = await res.json()
        const groupsData = data?.data
        if (
          res.status >= 200 &&
          res.status <= 299 &&
          groupsData.length !== groups.length
        ) {
          setLoading(false)
          setGroups(groupsData)
        } else {
          setLoading(false)
          toast.error(data?.error?.message)
        }
      } catch (error) {
        setLoading(false)
        toast.error(error.message)
      }
    }
    getGroups()
  }, [groups, cookies?.auth?.access_token])

  const handleOpenDialog = () => {
    setOpen(true)
  }
  const handleCloseDialog = () => {
    setOpen(false)
    setGroupName('')
  }

  const handleAddGroupChange = (event) => {
    setGroupName(event.target.value)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const handleAddGroupSubmit = async (event) => {
    event.preventDefault()
    try {
      const res = await postDataApi(
        'groups/add_group/',
        {name: groupName},
        cookies?.auth?.access_token
      )
      const data = await res.json()
      if (res.status >= 200 && res.status <= 299) {
        setGroups(data)
        handleCloseDialog()
        toast.success('Success')
      }

      if (res.status === 400) {
        toast.error(data?.error?.message)
      }
      if (res.status === 401) {
        toast.error(data?.messages[0].message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  const handleEditGroupSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await putDataApi(
        `groups/edit_group/${editGroupNameId}`,
        {
          name: editGroupName,
        },
        cookies?.auth?.access_token
      )
      const data = await res.json()
      if (res.status >= 200 && res.status <= 299) {
        setGroups(data)
        handleCloseDialog()
        toast.success('Success')
      }

      if (res.status === 400) {
        toast.error(data?.error?.message)
      }

      if (res.status === 401) {
        toast.error(data?.messages[0].message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    setEditGroupNameId(null)
  }
  const handleEditClick = async (event, group) => {
    event.preventDefault()
    setEditGroupNameId(group.id)
    setEditGroupName(group.name)
  }

  const handleCancelClick = () => {
    setEditGroupNameId(null)
  }
  const handleDeleteLocal = (groupName) => {
    const newGroups = [...groups]
    const index = groups.findIndex((contact) => contact.name === groupName)

    newGroups.splice(index, 1)

    setGroups(newGroups)
  }

  const handleDeleteClick = async (name) => {
    if (window.confirm('Are you sure?')) {
      try {
        const res = await postDataApi(
          'groups/delete_group/',
          {name},
          cookies?.auth?.access_token
        )
        const data = await res.json()
        if (res.status >= 200 && res.status <= 299) {
          handleDeleteLocal(name)
        }
        if (res.status === 401) {
          toast.error(data?.messages[0].message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  }
  const newGroups = groups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  return (
    <Paper className='app-container' sx={{marginTop: '1rem'}}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
        }}
      >
        <AddDialog
          open={open}
          handleOpenDialog={handleOpenDialog}
          handleCloseDialog={handleCloseDialog}
          groupName={groupName}
          handleAddGroupChange={handleAddGroupChange}
          handleAddGroupSubmit={handleAddGroupSubmit}
          data={data}
        />
        <Paper>
          <InputBase
            sx={{ml: 1, flex: 1}}
            placeholder='Search '
            inputProps={{'aria-label': 'search google maps'}}
            variant='outlined'
          />
          <Button type='submit' sx={{p: '10px'}} aria-label='search'>
            <SearchIcon />
          </Button>
        </Paper>
      </Box>
      <Divider />
      <Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, {label: 'All', value: -1}]}
          count={groups.length}
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
      </Box>
      <Divider />
      <Box>
        <form onSubmit={handleEditGroupSubmit}>
          <TableContainer sx={{maxHeight: '65vh', padding: ''}}>
            <Table stickyHeader>
              <TableHead></TableHead>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Group name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newGroups &&
                  newGroups.length > 0 &&
                  newGroups.map((group, index) => (
                    <Fragment key={group.id}>
                      {editGroupNameId === group.id ? (
                        <EditableRow
                          index={index}
                          editGroupName={editGroupName}
                          setEditGroupName={setEditGroupName}
                          handleCancelClick={handleCancelClick}
                        />
                      ) : (
                        <ReadOnlyRow
                          group={group}
                          index={index}
                          handleEditClick={handleEditClick}
                          handleDeleteClick={handleDeleteClick}
                        />
                      )}
                    </Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </form>
      </Box>
    </Paper>
  )
}

export default ManageGroupsPage
