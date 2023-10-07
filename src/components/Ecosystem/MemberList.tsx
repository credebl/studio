const MemberList = ({ecosystemId}:any) => {	
    return (
			<div className="flex justify-between p-2">

        <h2 className="text-3xl dark:text-white font-medium">Members List</h2>
				<a href={`/ecosystem/sent-invitations`} className="text-xl text-primary-700 dark:text-primary-600 hover:text-primary-800">Sent Invitations</a>
			</div>
    )
}

export default MemberList
