import {EditingState, ViewState} from '@devexpress/dx-react-scheduler'
import {
  Scheduler,
  WeekView,
  MonthView,
  Appointments,
  Toolbar,
  ViewSwitcher,
  EditRecurrenceMenu,
  DayView,
  DateNavigator,
  TodayButton,
  Resources,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
} from '@devexpress/dx-react-scheduler-material-ui'
import {Button, Divider, Paper} from '@material-ui/core'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import FormDate from '../../components/FormDate'
import FormSearch from '../../components/FormSearch'
import {AppointmentsContext} from '../../context/appointments/appointmentsContext'
import {ResourcesContext} from '../../context/resources/resourcesContext'
import {useContext, useState, useEffect} from 'react'
import {createStyles, makeStyles, styled} from '@material-ui/core/styles'
import {getBookingDataApi, deleteEventAPI} from '../../services/fetchDataApi'
import UseCookie from '../../context/auth/UseCookie'
import {toast} from 'react-toastify'
import AddEvent from '../../components/AddEvent'
import IconButton from '@mui/material/IconButton'
import EditEvent from '../../components/EditEvent'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const PREFIX = 'Demo'
const classes = {
  addButton: `${PREFIX}-addButton`,
}
const StyledIconButton = styled(IconButton)(() => ({
  [`&.${classes.commandButton}`]: {
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
}))

function showMonthData(date) {
  const firstDateOfMonth = date.setDate(1)
  const firstDate = new Date(firstDateOfMonth).setHours(0, 0, 0, 0)
  const realDate =
    new Date(firstDate).getDay() === 0 ? 7 : new Date(firstDate).getDay()
  const time_from = new Date(firstDate - (realDate - 1) * 24 * 60 * 60 * 1000)
  const time_to = new Date(
    time_from.getTime() + 42 * 24 * 60 * 60 * 1000
  ).toISOString()
  return {
    time_from: time_from.toISOString(),
    time_to,
  }
}

export default function DashboardDefaultContent() {
  const classes = useStyles()
  const [roomType, setRoomType] = useState(0)
  const [currentViewName, setCurrentViewName] = useState('work-week')
  const [date, setDate] = useState(new Date())
  const {cookies} = UseCookie()
  const [addedAppointment, setAddedAppointment] = useState({})
  const [appointmentChanges, setAppointmentChanges] = useState({})
  const [editingAppointment, setEditingAppointment] = useState(undefined)
  const [open, setOpen] = useState(false)
  const [openEvent, setOpenEvent] = useState(false)
  const [text, setText] = useState('')

  const {resources} = useContext(ResourcesContext)
  const {data, dataDispatch} = useContext(AppointmentsContext)
  const [weekTime, setWeekTime] = useState(showMonthData(new Date()))
  const [appoint, setAppoint] = useState({})
  //set data receive from api
  const [addedEvent, setAddedEvent] = useState({
    title: '',
    room: '',
    group: '',
    start_time: '',
    end_time: '',
    date: '',
    repeat: '',
    weekly: '',
    from_date: '',
    to_date: '',
  })
  // room booking info, showing on console when adding a room

  const realData =
    roomType === 0 ? data : data.filter((d) => d.location.includes(roomType))

  const Header = ({appointmentData, showCloseButton, ...restProps}) => {
    return (
      <AppointmentTooltip.Header
        {...restProps}
        showCloseButton
        appointmentData={appointmentData}
      >
        <StyledIconButton
          onClick={() => {
            setAppoint(appointmentData)
            restProps.onHide()
            setOpen(true)
          }}
          size='large'
        >
          <EditIcon />
        </StyledIconButton>
        <StyledIconButton
          onClick={() => {
            restProps.onHide()
            commitChanges({deleted: appointmentData.id})
          }}
          size='large'
        >
          <DeleteIcon />
        </StyledIconButton>
      </AppointmentTooltip.Header>
    )
  }

  function chooseRoom(number) {
    setRoomType(number)
  }

  function changeAddedAppointment(addedAppointment) {
    setAddedAppointment(addedAppointment)
  }

  function changeAppointmentChanges(appointmentChanges) {
    setAppointmentChanges(appointmentChanges)
  }

  function changeEditingAppointment(editingAppointment) {
    setEditingAppointment(editingAppointment)
  }

  function currentViewNameChange(currentViewName) {
    setCurrentViewName(currentViewName)
  }

  function currentDateChange(currentDate) {
    setDate(currentDate)
    setWeekTime(showMonthData(new Date(currentDate)))
  }

  const handleChooseRoom = (roomType) => {
    setRoomType(roomType)
  }

  async function commitChanges({added, changed, deleted}) {
    if (added) {
      dataDispatch({
        type: 'ADDED',
        added,
      })
    }
    if (changed) {
      dataDispatch({
        type: 'CHANGED',
        changed,
      })
    }
    if (deleted !== undefined) {
      try {
        const res = await deleteEventAPI(deleted, cookies?.auth?.access_token)
        const event = await res.json()

        if (event.success) {
          dataDispatch({
            type: 'DELETED',
            deleted,
          })
        }
      } catch {
        toast.error('Internal server error')
      }
    }
  }
  const fetchEventData = async () => {
    try {
      const res = await getBookingDataApi(weekTime, cookies?.auth?.access_token)
      const event = await res.json()
      const mapData = await event.data.map((event) => ({
        title: event.event.title,
        startDate: new Date(event.time_from),
        endDate: new Date(event.time_to),
        location: event.room.id,
        id: event.id,
        group_id: event.event.id,
      }))

      if (mapData !== data && res.status === 200) {
        dataDispatch({
          type: 'INIT',
          data: mapData,
        })
      }
    } catch (err) {
      toast.error(data?.messages[0].message)
    }
  }

  useEffect(() => {
    if (resources[0].instances.length !== 0) {
      fetchEventData()
    }
  }, [weekTime, resources])

  return (
    <Paper style={{display: 'flex', marginTop: '1rem', padding: '1rem'}}>
      <div className={classes.root}>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 1rem 1rem 0',
            width: '100%',
          }}
        >
          <EditEvent
            open={open}
            setOpen={setOpen}
            appointment={appoint}
            locations={resources[0].instances}
          />

          <FormDate
            data={data}
            locations={resources[0].instances}
            setDate={setDate}
          />
          <FormSearch
            data={data}
            setDate={setDate}
            setCurrentViewName={setCurrentViewName}
          />
        </Box>
        <Divider />
        <Box style={{display: 'flex'}}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: '.5rem 1rem 0 0 ',
            }}
          >
            <Button
              variant='contained'
              onClick={() => setOpenEvent(true)}
              style={{
                background: 'rgb(25 118 210)',
                color: '#fff',
                marginBottom: '4rem',
              }}
            >
              Add
            </Button>
            <AddEvent
              open={openEvent}
              setOpen={setOpenEvent}
              fetchEventData={fetchEventData}
            />
            <Stack spacing={1}>
              <Button
                startIcon={<DoubleArrowIcon />}
                size='small'
                variant='contained'
                onClick={() => chooseRoom(0)}
                style={{width: '100px'}}
              >
                All
              </Button>

              {resources[0].instances.map((item) => (
                <Button
                  key={item.id}
                  size='small'
                  variant='contained'
                  style={{
                    background: item.color,
                    color: '#fff',
                    border: roomType === item.id && '3px solid red',
                  }}
                  onClick={() => chooseRoom(item.id)}
                >
                  {item.text}
                </Button>
              ))}
            </Stack>
          </div>
          <Scheduler data={realData} height={500}>
            <ViewState
              currentDate={date}
              currentViewName={currentViewName}
              onCurrentDateChange={currentDateChange}
              onCurrentViewNameChange={currentViewNameChange}
            />
            <EditingState
              onCommitChanges={commitChanges}
              addedAppointment={addedAppointment}
              onAddedAppointmentChange={changeAddedAppointment}
              appointmentChanges={appointmentChanges}
              onAppointmentChangesChange={changeAppointmentChanges}
              editingAppointment={editingAppointment}
              onEditingAppointmentChange={changeEditingAppointment}
            />

            <WeekView startDayHour={8} endDayHour={19} />
            <WeekView
              name='work-week'
              displayName='Work Week'
              excludedDays={[0, 6]}
              startDayHour={8}
              endDayHour={19}
            />
            <MonthView />
            <DayView />

            <EditRecurrenceMenu />
            <Toolbar />
            <DateNavigator />
            <TodayButton />
            <ViewSwitcher />
            <Appointments />
            {/* this plugin below (not important plugin) is the cause of warning */}
            <AppointmentTooltip headerComponent={Header} showCloseButton />
            <AppointmentForm />
            <DragDropProvider />
            <Resources data={resources} mainResourceName={'location'} />
          </Scheduler>
        </Box>
      </div>
    </Paper>
  )
}
const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      '& .MainLayout-container ': {
        maxHeight: '370px',
      },
    },
  })
)
