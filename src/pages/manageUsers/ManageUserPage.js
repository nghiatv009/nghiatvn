import {makeStyles} from '@material-ui/core'
import SearchIcon from '@mui/icons-material/Search'
import {
  Button,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {useEffect, useState} from 'react'
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import UseCookie from './../../context/auth/UseCookie'
import {getDataApi} from './../../services/fetchDataApi'
import {validateEmail, validateFullname} from './../../utils/validate'
import ModalUser from './ModalUser'
import ReadOnlyRow from './ReadOnlyRow'

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
  },
}))

const initialValue = {
  fullname: '',
  email: '',
}

const ManageUsersPage = () => {
  const classes = useStyles()
  const {cookies} = UseCookie()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const [openModalUser, setOpenModalUser] = useState(false)

  const [fullname, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [group, setGroup] = useState('')
  const [supperUser, setSupperUser] = useState(false)

  const [userEdit, setUserEdit] = useState(initialValue)
  const [editUserId, setEditUserId] = useState(null)

  const [validFullName, setValidFullName] = useState(false)
  const [fullNameFocus, setFullNameFocus] = useState(false)

  const [validEmail, setValidEmail] = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)

  const [invalidFullname, setInvalidFullname] = useState('')
  const [invalidEmail, setInvalidEmail] = useState('')

  const [errMsg, setErrMsg] = useState('')

  const data = {
    fullname,
    setFullName,
    email,
    setEmail,
    group,
    setGroup,
    supperUser,
    setSupperUser,
    validFullName,
    setValidFullName,
    validEmail,
    setValidEmail,
    invalidFullname,
    setInvalidFullname,
    invalidEmail,
    setInvalidEmail,
    fullNameFocus,
    setFullNameFocus,
    emailFocus,
    setEmailFocus,
    errMsg,
    setErrMsg,
  }

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true)
        const res = await getDataApi('user/', cookies?.auth?.access_token)
        const data = await res.json()
        const users = data?.data
        if (users && res.status >= 200 && res.status <= 299) {
          setLoading(false)
          setUsers(users)
        } else {
          setLoading(false)
          toast.error(data?.error?.message)
        }
      } catch (error) {
        setLoading(false)
        toast.error(error.message)
      }
    }
    getUsers()
  }, [cookies?.auth?.access_token])

  useEffect(() => {
    if (editUserId) {
      setFullName(userEdit.fullname)
      setEmail(userEdit.email)
      setGroup(userEdit.group === null ? '' : userEdit.group)
      setSupperUser(userEdit.is_superuser)
      setEditUserId(userEdit.id)
      setValidEmail(false)
      setInvalidEmail('')
    } else {
      setFullName('')
      setEmail('')
      setGroup('')
      setSupperUser(false)
    }
  }, [
    editUserId,
    userEdit.fullname,
    userEdit.email,
    userEdit.group,
    userEdit.is_superuser,
    userEdit.id,
  ])

  const handleOpenModalUser = () => {
    setOpenModalUser(true)
  }
  const handleCloseModalUser = () => {
    setOpenModalUser(false)
    setFullName('')
    setEmail('')
    setGroup('')
    setSupperUser(false)
    setErrMsg('')
    setValidFullName(false)
    setValidEmail(false)
    setInvalidFullname('')
    setInvalidEmail('')
  }
  const handleCloseModalEditUser = () => {
    setOpenModalUser(false)
    setEditUserId(null)
    setUserEdit(initialValue)
    setValidEmail(false)
    setInvalidEmail('')
  }
  const updateUser = (fullname, email, group, supperUser, id) => {
    let strGroup = group === null ? '' : group
    const newUser = users.map((user) => {
      return user.id === id
        ? {...user, id, fullname, email, group: strGroup, supperUser}
        : user
    })
    setUsers(newUser)
  }
  const handleFormSubmit = () => {
    setInvalidFullname(validateFullname(fullname))
    setInvalidEmail(validateEmail(email))

    if (!editUserId) {
      const user = {
        id: Math.floor(Math.random() * 9999),
        fullname,
        email,
        group,
        supperUser,
      }
      if (fullname && validFullName && email && validEmail) {
        setUsers([...users, user])
        handleCloseModalUser()
        toast.success('Successfully added new user !')
      }
    } else {
      if (fullname && validFullName) {
        updateUser(
          userEdit.fullname,
          userEdit.email,
          userEdit.group,
          userEdit.supperUser,
          userEdit.id
        )
        handleCloseModalEditUser()
        toast.success('User update successful !')
      }
    }
  }

  const handleDelete = (id) => {
    let newUsers = [...users]
    newUsers = newUsers.filter((user) => user.id !== id)
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(newUsers)
      toast.success('Delete user successfully !')
    }
  }

  const handleEditClick = (editUser) => {
    setOpenModalUser(true)
    setEditUserId(editUser.id)
    setUserEdit(editUser)
    setFullName(editUser.fullname)
    setEmail(editUser.email)
    setGroup(editUser.group === null ? '' : editUser.group)
    setSupperUser(editUser.is_superuser)
    setValidEmail(false)
    setInvalidEmail('')
  }

  return (
    <div className='app-container'>
      <ToastContainer
        position='top-right'
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Paper
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          margin: '20px 0',
        }}
      >
        <Button
          variant='contained'
          color='primary'
          onClick={handleOpenModalUser}
        >
          Add User
        </Button>
        <ModalUser
          open={openModalUser}
          handleCloseModalUser={handleCloseModalUser}
          handleCloseModalEditUser={handleCloseModalEditUser}
          handleFormSubmit={handleFormSubmit}
          editUserId={editUserId}
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
      </Paper>

      {/* <TableContainer sx={{maxHeight: '70vh', padding: '0 10px'}}> */}
      <Table className={classes.table} stickyHeader aria-label='sticky table'>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Full name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Group</TableCell>
            <TableCell>Created at</TableCell>
            <TableCell>Supper User</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        {users && users.length > 0 ? (
          <TableBody>
            {users.map((user, index) => (
              <ReadOnlyRow
                index={index}
                key={user.id}
                user={user}
                handleEditClick={handleEditClick}
                handleDelete={handleDelete}
                setEditUserId={setEditUserId}
              />
            ))}
          </TableBody>
        ) : loading ? (
          <TableBody>
            <TableRow style={{height: '50vh', background: '#fff'}}>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell style={{fontSize: 17}}>Loading...</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            <TableRow style={{height: '50vh', background: '#fff'}}>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>No User</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>
      {/* </TableContainer> */}
    </div>
  )
}

export default ManageUsersPage
