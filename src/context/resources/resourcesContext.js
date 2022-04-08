import { createContext, useReducer, useEffect } from 'react'
import resourcesReducer from './resourcesReducer'
import UseCookie from '../auth/UseCookie'
import { getListRoomApi } from '../../services/fetchDataApi'
export const ResourcesContext = createContext()

const init = [
	//setting room color, text, kiểu dữ liệu để fetch
	{
		fieldName: 'location',
		title: 'Location',
		instances: [
			// { id: 'tsubaki', text: 'Tsubaki', color: 'black'},
			// { id: 'ajisai', text: 'Ajisai', color: 'green' },
			// { id: 'sakura', text: 'Sakura', color: 'red' },
			// { id: 'ume', text: 'Ume', color: 'orange' },
			// { id: 'fuji', text: 'Fuji', color: 'blue' },
			// { id: 'vip', text: 'Vip', color: 'purple' },
		],
	},
	{
		fieldName: 'groups',
		title: 'Groups',
		instances: [
			{ id: 'e1900341-2441-4ede-bc7f-e7e7adf4907d', text: 'HCNS' },
			{ id: 'Arnie Schwartz', text: 'Arnie Schwartz' },
			{ id: 'John Heart', text: 'John Heart' },
			{ id: 'Taylor Riley', text: 'Taylor Riley' },
			{ id: 'Brad Farkus', text: 'Brad Farkus' },
		],
	},
]

export default function ResourcesProvider({ children }) {
	const { cookies } = UseCookie()

	const [resources, resourcesDispatch] = useReducer(resourcesReducer, init)
	useEffect(() => {
		async function fetchData() {
			const res = await getListRoomApi(cookies?.auth?.access_token)
			const data = await res.json()

			if (data.success) {
				const rooms = data.data.map((item) => ({
					id: item.id,
					text: item.name,
					color: item.color,
					size: item.size,
					peripheral: item.is_peripheral,
					roomVip: item.is_vip,
				}))
				resourcesDispatch({
					type: 'INIT_LOCATION',
					data: rooms,
				})
			}
		}
		fetchData()
	}, [cookies?.auth?.access_token])
	const data = { resources, resourcesDispatch }
	return <ResourcesContext.Provider value={data}>{children}</ResourcesContext.Provider>
}
