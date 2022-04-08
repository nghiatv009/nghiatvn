import React, { useState, useEffect, useContext } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import TimePicker from '@mui/lab/TimePicker'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import DatePicker from '@mui/lab/DatePicker'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { AppointmentsContext } from '../context/appointments/appointmentsContext'
// import { addEvent } from '../services/fetchDataApi'
import Collapse from '@mui/material/Collapse';
import { 
	getRRuleValue,
	convertUTCDateToLocalDate,
	convertStringDate,
	changedRRule,
	convertLocalDateToUTCDateStr
 } from '../utils/schedulerFunctions'
import RecurrenceDialog from './RecurrenceDialog'

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

export default function EditEvent({ open, setOpen, appointment, locations }) {
	const { dataDispatch } = useContext(AppointmentsContext)

	const [title, setTitle] = useState()
	const [email, setEmail] = useState()
	const [room, setRoom] = useState('')
	const [group, setGroup] = useState()
	const [date, setDate] = useState(new Date())
	const [startTime, setStartTime] = useState(new Date())
	const [endTime, setEndTime] = useState(new Date())
	const [timeFrom, setTimeFrom] = useState(new Date())
	const [timeTo, setTimeTo] = useState(new Date())
	const [isDisable, setIsDisable] = useState(false)
	const [editAll, setEditAll] = useState('false')
	const [isRecurrence, setIsRecurrence] = useState(false)
	const [byDay, setByDay] = useState({
		MO: false,
		TU: false,
		WE: false,
		TH: false,
		FR: false,
		SA: false,
		SU: false
	})
    useEffect( () => {
		const { title, location, startDate, endDate, email, rRule } = appointment
        setTitle(title)
        setRoom(location)
        setDate(startDate)
        setStartTime(startDate)
        setEndTime(endDate)
		setEmail(email)
		if( rRule ) {
			setIsDisable(true)
			const byDayValue = getRRuleValue(rRule, 'BYDAY').split(',')
			byDayValue.forEach(item => {
				setByDay( state => ({
					...state,
					[item] : true
				}))
			})
			const untilStr = getRRuleValue(appointment.rRule, 'UNTIL')
			setTimeTo( convertUTCDateToLocalDate(convertStringDate(untilStr)) )
			setTimeFrom( appointment.parentData.startDate )

		} else {
			setIsDisable(false)
			setTimeTo( startDate )
		}
    }, [appointment])

	const handleClose = () => {
		setOpen(false)
	}

	function handleRecurrenceChangeSubmit(
		appointment, 
		title,
		room, 
		date,
		startTime, 
		endTime, 
		email
		) {
		const { id } = appointment
		const value = {
			title,
			location: room,
			startDate: new Date(
				date?.getFullYear(), 
				date?.getMonth(), 
				date?.getDate(), 
				startTime?.getHours(), 
				startTime?.getMinutes()
			),
			endDate: new Date(
				date?.getFullYear(), 
				date?.getMonth(), 
				date?.getDate(), 
				endTime?.getHours(), 
				endTime?.getMinutes()
			),
			email
		}

		return e => {
			e.preventDefault()
			console.log(typeof editAll)

			const deleted = id
			if(editAll.toString() === 'false') {
				console.log(editAll)
				const parentStart = appointment.parentData.startDate
				const start = value.startDate

				const exactExDate = new Date(
					start.getFullYear(),
					start.getMonth(),
					start.getDate(),
					parentStart.getHours(),
					parentStart.getMinutes(),
					parentStart.getSeconds()
				)
				const newExDate = convertLocalDateToUTCDateStr( exactExDate )
				const exxDate = appointment.exDate 
				? appointment.exDate
					.split(',')
					.concat(newExDate)
					.join(',') 
				: newExDate

				dataDispatch({
					type: 'CHANGED',
					changed: {
						[id]: {
							exDate: exxDate
						}
					}
				})
				console.log(exxDate, id)
			} else {
				dataDispatch({
					type: 'DELETED',
					deleted
				}) 
			}
			dataDispatch({
				type: 'ADDED',
				added: value
			})
			setEditAll(false)
			setIsRecurrence(false)
			setOpen(false)
		}
	}

    function handleChangeSubmit(e) {
            e.preventDefault()
			const { id, rRule, exDate } = appointment
			console.log(exDate)
			const newByDay = 
				Object
				.entries(byDay)
				.filter( item => item[1] )
				.map( item => item[0] )
				.join(',')

			const changed = {
				[id] : {
					title,
					location: room,
					startDate: new Date(
						date.getFullYear(), 
						date.getMonth(), 
						date.getDate(), 
						startTime.getHours(), 
						startTime.getMinutes()
					),
					endDate: new Date(
						date.getFullYear(), 
						date.getMonth(), 
						date.getDate(), 
						endTime.getHours(), 
						endTime.getMinutes()
					),
					email
				}
			  }
			if( !isDisable && !rRule ) {
				dataDispatch({
					type: 'CHANGED',
					changed
				})
			} else if( isDisable && !rRule ) {
				const timeToUTCStr = convertLocalDateToUTCDateStr(timeTo)
				const newRRule = `RRULE:INTERVAL=1;FREQ=WEEKLY;UNTIL=${timeToUTCStr};BYDAY=${newByDay}`
				changed[appointment?.id].rRule =  newRRule

				console.log(changed)
				dataDispatch({
		  			type: 'CHANGED',
		  			changed
				})
			} else if( !isDisable && rRule ) {
				setIsRecurrence(true)
				return
			} else if( isDisable && rRule) {
				const parentStart = appointment.parentData.startDate
				const weeklyChanged = {
					[id] : {
						...changed[id],
						startDate: new Date(
							parentStart.getFullYear(), 
							parentStart.getMonth(), 
							parentStart.getDate(), 
							startTime.getHours(), 
							startTime.getMinutes()),
						endDate: new Date(
							parentStart.getFullYear(), 
							parentStart.getMonth(), 
							parentStart.getDate(), 
							endTime.getHours(), 
							endTime.getMinutes()),
					}
				}
				if( exDate ) {
					weeklyChanged[id].exDate = exDate
				}
				//case 2 exDate:  parentStart !== startTime 
				const timeToUTCStr = convertLocalDateToUTCDateStr(timeTo)
				const newRRule =  changedRRule(appointment.rRule, newByDay, 'BYDAY')
				weeklyChanged[appointment?.id].rRule =  changedRRule(newRRule, timeToUTCStr , 'UNTIL')
			
            	dataDispatch({
              		type: 'CHANGED',
              		changed: weeklyChanged
            	})
			}
            setOpen(false)
    }

	function checkAll() {
		const { MO, TU, WE, TH, FR, SA, SU } = byDay
		return MO && TU && WE && TH && FR && SA && SU
	}

	function byDaySet(prop) {
		return e => {
			setByDay({
				...byDay,
				[prop] : e.target.checked
			})
		}
	}

	function ok() {
    	return (
        <>
        <Box>
        <FormControlLabel
                control={
                    <Checkbox
						checked={checkAll()}
                        onChange={(e) => {
							const checked = e.target.checked
							setByDay(
								{
									MO: checked,
									TU: checked,
									WE: checked,
									TH: checked,
									FR: checked,
									SA: checked,
									SU: checked
								}
							)
                        }}
                    />
                }
                labelPlacement='start'
                label='All'
            />
            <FormControlLabel
                control={
                    <Checkbox
						value='MON'
                        checked={byDay.MO}
						onChange={byDaySet('MO')}
                    />
                }
                labelPlacement='start'
                label='Mon'
            />
            <FormControlLabel
                control={
					<Checkbox  						
						value='TUE'
                        checked={byDay.TU}
						onChange={byDaySet('TU')} 
						/>
				}
                labelPlacement='start'
                label='Tue'
            />
            <FormControlLabel
                control={
					<Checkbox  						
						value='WED'
                        checked={byDay.WE}
						onChange={byDaySet('WE')} 
					/>
				}
                labelPlacement='start'
                label='Wed'
            />
            <FormControlLabel
                control={
					<Checkbox  						
						value='THU'
                        checked={byDay.TH}
						onChange={byDaySet('TH')} 
					/>
				}
                labelPlacement='start'
                label='Thu'
            />
            <FormControlLabel
                control={
					<Checkbox  						
						value='FRI'
                        checked={byDay.FR}
						onChange={byDaySet('FR')} 
						/>
				}
                labelPlacement='start'
                label='Fri'
            />
            <FormControlLabel
                control={
					<Checkbox  						
						value='SAT'
                        checked={byDay.SA}
						onChange={byDaySet('SA')} 
						/>
				}
                labelPlacement='start'
                label='Sat'
            />
            <FormControlLabel
                control={
					<Checkbox  						
						value='SUN'
                        checked={byDay.SU}
						onChange={byDaySet('SU')} 
						/>
				}
                labelPlacement='start'
                label='Sun'
            />
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
        </>
    )
	}
	return (
		<div>
			<RecurrenceDialog 
				isRecurrence={isRecurrence}
				setIsRecurrence={setIsRecurrence}
				editAll={editAll}
				setEditAll={setEditAll}
				handleRecurrenceChangeSubmit={handleRecurrenceChangeSubmit(appointment, title, room, date, startTime, endTime, email)}
				/>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
				fullWidth={true}
				maxWidth={'md'}
			>
				<DialogTitle id='alert-dialog-title'>{'Edit Event'}</DialogTitle>
				<DialogContent>
					<Box
						component='form'
						sx={{
							'& .MuiTextField-root': { margin: '.5rem 0 .5rem 0' },
						}}
						noValidate
						autoComplete='off'
						onSubmit={handleChangeSubmit}
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
						<TextField 
							label='Email' 
							fullWidth size='small'
							value={email}
							onChange={(e) => {
								setEmail(e.target.value)
							}} />
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
								{locations.map((option) => (
									<MenuItem key={option.id} value={option.id}>
										{option.text}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<LocalizationProvider dateAdapter={AdapterDateFns}>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									width: '100%',
									gap: '1rem',
									marginBottom: '2rem',
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
									onChange={(newValue) => {                         
                                        setStartTime(newValue)}}
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
									checked={isDisable}
										onChange={(e) => setIsDisable(e.target.checked)}
									/>
								}
								labelPlacement='start'
								label='Repeat'
							/>
						</Box>
                        <Collapse in={isDisable}>{ok()}</Collapse> 
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleChangeSubmit}>EDIT</Button>
					<Button onClick={handleClose}>CLOSE</Button>
				</DialogActions>
			</Dialog>
		</div>
	)
}

