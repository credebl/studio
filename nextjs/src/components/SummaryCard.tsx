import { Card, CardContent } from '@/components/ui/card';

import CopyDid from '@/config/CopyDid';

interface IProps {
	schemaName: string;
	version: string;
	credDefId?: string;
	schemaId: string;
	hideCredDefId?: boolean;
}

const SummaryCard = ({ schemaName, version, credDefId, schemaId, hideCredDefId }: Readonly<IProps>) => {
	return (
			<Card className='my-6'>
				<CardContent className='p-6'>
					<div className="flex justify-between items-start">
						<div>
							<h5 className="text-xl font-bold leading-none dark:text-white">
								{schemaName}
							</h5>
							<div className="dark:text-white mb-4">
								<b>Version</b>: {version}
							</div>
						</div>
					</div>
					<div className="min-w-0 flex-1 issuance">
						<div className="truncate dark:text-white break-all flex relative">
							<span className="font-semibold mr-2"><b>Schema ID:</b> </span>
							<span className='flex w-schema-id'>
								<CopyDid value={schemaId || ""} className='truncate font-courier mt-[2px]' />
							</span>
						</div>
							<div className="truncate dark:text-white break-all flex">
								<span className="font-semibold mr-2"><b>Credential Definition:</b> </span>
								<span className='flex w-cred-id'>
									<CopyDid value={credDefId || ""} className='truncate font-courier mt-[2px]' />
								</span>
							</div>
					</div>
				</CardContent>
			</Card>
	);
};

export default SummaryCard;
