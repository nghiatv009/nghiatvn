import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { nonAccentVietnamese } from '../utils/nonAccent'
export default function SearchDialog({
	text,
	open,
	setOpen,
	result,
	setSearch,
	setDate,
	data,
	setCurrentViewName,
}) {
	const handleClose = () => {
		setOpen(false)
	}
	function handle() {
		return (
			<>
				<Typography gutterBottom sx={{ fontWeight: 'bold' }}>
					{text.length} room(s) matched the search pattern :
				</Typography>
				{text.map((item) => (
					<Typography gutterBottom key={item}>
						{item}
					</Typography>
				))}
			</>
		)
	}
	const handleSelect = (e) => {
		const result = data.find(
			(data) => nonAccentVietnamese(data.title) === nonAccentVietnamese(e.target.value),
		)
		if (result !== 0) {
			setCurrentViewName('Day')
			setDate(result.startDate)
		}
		handleClose()
	}
	return (
		<div className={{ position: 'fixed', zIndex: 1000 }}>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
			>
				<DialogTitle id='alert-dialog-title'>{'Event matched'}</DialogTitle>
				<DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
					{result.map((result) => (
						<Button key={result.id} value={result.title} onClick={handleSelect}>
							{`${result.title} start at ${result.startTime} in ${result.location}`}
						</Button>
					))}
				</DialogContent>
			</Dialog>
		</div>
	)
}
