import React from 'react'
import UserProfileForm from './UserProfileForm'
import type { User } from '../../types/User'

type Props = {
	user: User
	editable?: boolean
	onSubmit?: (updated: User) => void
	onClose: () => void
}

const UserProfileModal: React.FC<Props> = ({
	user,
	editable,
	onSubmit,
	onClose,
}) => {
	return (
		<div className='modal-overlay'>
			<div className='modal-content'>
				<UserProfileForm
					user_to={user}
					editable={editable}
					onSubmit={updatedUser => {
						if (updatedUser) {
							onSubmit?.(updatedUser)
							onClose()
						}
					}}
					onClose={onClose}
				/>
			</div>
		</div>
	)
}

export default UserProfileModal
