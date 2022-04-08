import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import TimePicker from '@mui/lab/TimePicker'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import DatePicker from '@mui/lab/DatePicker'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import UseCookie from '../context/auth/UseCookie'
import { set } from 'date-fns'
import { addEvent } from '../services/fetchDataApi'
import { toast } from 'react-toastify'
import isEmpty from 'validator/lib/isEmpty'
import FormGroup from '@mui/material/FormGroup'

const groups = [
	{
		value: 'Group1',
		label: 'Group1',
	},
	{
		value: 'Group2',
		label: 'Group2',
	},
	{
		value: 'Group3',
		label: 'Group3',
	},
	{
		value: 'Group4',
		label: 'Group4',
	},
]

const rooms = [
	{
		value: 'sakura',
		label: 'sakura',
	},
	{
		value: 'ume',
		label: 'ume',
	},
	{
		value: 'ajisai',
		label: 'ajisai',
	},
	{
		value: 'kiku',
		label: 'kiku',
	},
	{
		value: 'fuji',
		label: 'fuji',
	},
	{
		value: 'tsubaki',
		label: 'tsubaki',
	},
	{
		value: 'vip',
		label: 'vip',
	},
]
const weekData = [
	{ name: 'Mon', index: '2' },
	{ name: 'Tue', index: '3' },
	{ name: 'Wed', index: '4' },
	{ name: 'Thu', index: '5' },
	{ name: 'Fri', index: '6' },
]
function AddEvent({ open, setOpen, fetchEventData }) {
	const [title, setTitle] = useState('')
	const [group, setGroup] = useState()
	const [room, setRoom] = useState('')
	const [date, setDate] = useState(new Date())
	const [startTime, setStartTime] = useState(new Date())
	const [endTime, setEndTime] = useState(new Date())
	const [timeFrom, setTimeFrom] = useState(new Date())
	const [timeTo, setTimeTo] = useState(new Date())
	const { cookies, removeCookie } = UseCookie()
	const [isDisable, setIsDisable] = useState(true)
	const [isChecked, setIsChecked] = useState(false)
	const [weekly, setWeekly] = useState([])
	const [validationMsg, setValidationMsg] = useState({})
	const [week, setWeek] = useState(weekData)

	const validateAll = () => {
		const msg = {}
		if (isEmpty(title)) {
			msg.title = 'Please input your Sammary!'
		}
		if (isEmpty(room)) {
			msg.room = 'Please select your Room!'
		}
		const a = new Date(startTime).getTime()
		const b = new Date(endTime).getTime()
		if (a > b) {
			msg.endTime = 'Start time must be less than end time!'
		}
		if (!date) {
			msg.date = 'empty your date!'
		}
		const x = new Date(timeFrom).getTime()
		const y = new Date(timeTo).getTime()
		if (x > y) {
			msg.edate = 'From date must be less than to date!'
		}
		setValidationMsg(msg)
		if (Object.keys(msg).length > 0) return false
		return true
	}

	const handleClose = () => {
		setOpen(false)
		setTitle('')
		setRoom('')
		setWeekly([])
	}
	const handeleWeeklyCheck = (e) => {
		var updatedList = [...weekly]
		if (e.target.checked) {
			updatedList = [...weekly, e.target.value]
		} else {
			updatedList.splice(weekly.indexOf(e.target.value), 1)
		}
		setWeekly(updatedList)
	}

	const handleSubmit = async () => {
		const isValid = validateAll()
		if (!isValid) {
			return
		} else {
			const eventDate = date.toISOString().slice(0, 10)
			const start_time = startTime.toISOString().slice(11, 19)
			const end_time = endTime.toISOString().slice(11, 19)
			const time_from = timeFrom.toISOString().slice(0, 10)
			const time_to = timeTo.toISOString().slice(0, 10)
			let addEventForm = {}

			if (isDisable) {
				addEventForm = {
					title: title,
					room: room,
					start_time: start_time,
					end_time: end_time,
					date: eventDate,
					repeat: 'False',
				}
			} else {
				addEventForm = {
					title: title,
					room: room,
					start_time: start_time,
					end_time: end_time,
					date: eventDate,
					repeat: 'True',
					weekly: `${weekly.toString()}`,
					from_date: time_from,
					to_date: time_to,
				}
			}

			try {
				const res = await addEvent(addEventForm, cookies?.auth?.access_token)
				const message = await res.json()
				if (res.status >= 200 && res.status <= 299) {
					toast.success('Success!')
					handleClose()
					fetchEventData()
				} else if (res.status === 401) {
					toast.error('Un authorize user')
				} else {
					toast.error('Invalid request!')
				}
				handleClose()
			} catch (err) {
				toast.error(err)
			}
		}
	}

	return (
		<div>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
				fullWidth={true}
				maxWidth={'md'}
			>
				<DialogTitle id='alert-dialog-title'>{'Add Event'}</DialogTitle>
				<DialogContent>
					<Box
						component='form'
						sx={{
							'& .MuiTextField-root': { margin: '.5rem 0 .5rem 0' },
						}}
						noValidate
						autoComplete='off'
						onSubmit={handleSubmit}
					>
						<TextField
							required
							label='Summary'
							fullWidth
							size='small'
							value={title}
							onChange={(e) => {
								setTitle(e.target.value)
							}}
						/>
						<p style={{ color: 'red', fontSize: '12px', marginLeft: '40px' }}>
							{validationMsg.title}
						</p>
						<TextField label='Email' fullWidth size='small' />
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								width: '100%',
								gap: '1rem',
							}}
						>
							<TextField
								select
								value={group}
								onChange={(e) => {
									setGroup(e.target.value)
								}}
								label='Group'
								size='small'
								sx={{ width: '100%' }}
							>
								{groups.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</TextField>

							<TextField
								select
								value={room}
								onChange={(e) => {
									setRoom(e.target.value)
								}}
								label='Room'
								size='small'
								sx={{ width: '100%' }}
								required
							>
								{rooms.map((option) => (
									<MenuItem key={option.value} value={option.value}>
										{option.label}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<p
							style={{
								color: 'red',
								fontSize: '12px',
								textAlign: 'end',
								paddingRight: '1rem',
							}}
						>
							{validationMsg.room}
						</p>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
									gap: '1rem',
								}}
							>
								<DatePicker
									label='Date'
									value={date}
									onChange={(newValue) => {
										setDate(newValue)
									}}
									renderInput={(params) => (
										<TextField size='small' sx={{ width: '100%' }} {...params} />
									)}
								/>

								<TimePicker
									value={startTime}
									label='Start time'
									onChange={(newValue) => setStartTime(newValue)}
									renderInput={(params) => (
										<TextField size='small' required sx={{ width: '100%' }} {...params} />
									)}
								/>
								<TimePicker
									value={endTime}
									label='End time'
									onChange={(newValue) => setEndTime(newValue)}
									renderInput={(params) => (
										<TextField size='small' required sx={{ width: '100%' }} {...params} />
									)}
								/>
							</Box>
						</LocalizationProvider>
						<span style={{ color: 'red', fontSize: '12px', marginLeft: '40px' }}>
							{validationMsg.endTime}
						</span>
						<span style={{ color: 'red', fontSize: '12px', marginLeft: '40px' }}>
							{validationMsg.date}
						</span>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'flex-start',
								width: '40vw',
								flexShrink: '0',
							}}
						>
							<FormControlLabel
								control={
									<Checkbox
										onChange={(e) => {
											if (e.target.checked === true) {
												setIsDisable(false)
											} else {
												setIsDisable(true)
											}
										}}
									/>
								}
								labelPlacement='start'
								label='Repeat'
							/>
							<FormControlLabel
								control={
									<Checkbox
										onChange={(e) => {
											if (e.target.checked === true) {
												setIsChecked(true)
											} else {
												setIsChecked(false)
											}
										}}
										disabled={isDisable}
									/>
								}
								labelPlacement='start'
								label='All'
							/>
						</Box>
						<Box>
							<FormGroup>
								<div>
									{week.map((user, index) => (
										<FormControlLabel
											key={index}
											label={user.name}
											control={
												<Checkbox
													value={user.index}
													disabled={isDisable}
													name={user.name}
													onChange={handeleWeeklyCheck}
												/>
											}
										/>
									))}
								</div>
							</FormGroup>
						</Box>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								width: '100%',
								gap: '1rem',
							}}
						>
							<LocalizationProvider dateAdapter={AdapterDateFns}>
								<DatePicker
									label='Date'
									value={timeFrom}
									onChange={(newValue) => {
										setTimeFrom(newValue)
									}}
									renderInput={(params) => (
										<TextField size='small' sx={{ width: '100%' }} {...params} />
									)}
								/>
								<DatePicker
									label='Date'
									value={timeTo}
									onChange={(newValue) => {
										setTimeTo(newValue)
									}}
									renderInput={(params) => (
										<TextField size='small' sx={{ width: '100%' }} {...params} />
									)}
								/>
							</LocalizationProvider>
						</Box>
						<span style={{ color: 'red', fontSize: '12px', marginLeft: '40px' }}>
							{validationMsg.edate}
						</span>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSubmit}>ADD</Button>
					<Button onClick={handleClose}>CLOSE</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

export default AddEvent
