import Dashboard from '../../commonComponents/Dashboard';
import { pathRoutes } from '../../config/pathRoutes';
import BackButton from '../../commonComponents/backbutton';
import { getFromLocalStorage } from '../../api/Auth';
import { storageKeys } from '../../config/CommonConstant';
import { useEffect, useState } from 'react';
import { DidMethod } from '../../common/enums';

const IssueDashboard = () => {

	const [isW3cDid, setisW3cDid] = useState<boolean>(false);

const orgData =async () =>{
	const orgDid = await getFromLocalStorage(storageKeys.ORG_DID);	
	if(orgDid.includes(DidMethod.POLYGON) || orgDid.includes(DidMethod.WEB) || orgDid.includes(DidMethod.KEY)){
		setisW3cDid(true)
	} else {
		setisW3cDid(false)
	}
}
  useEffect(() => {
	orgData();
	}, []);

	const options = [
		{		
			heading: 'Connection',
			description:
			'Issue credential(s) by selecting connection from existing users',
			path: isW3cDid ? pathRoutes.organizations.Issuance.connection : pathRoutes.organizations.Issuance.schema

		},
		{
			heading: 'Email',
			description: 'Issue credential(s) by entering email ID for specific user',
			path: pathRoutes.organizations.Issuance.email,
		},
		{
			heading: 'Bulk',
			description: 'Issue credential(s) by uploading .csv file records',
			path: pathRoutes.organizations.Issuance.bulkIssuance,
		},
	];

	return (
		<Dashboard
			title="Issue Credential"
			options={options}
			backButtonPath={pathRoutes.organizations.issuedCredentials}
		/>
	);
};

export default IssueDashboard;
