import { Card, CardContent } from '@/components/ui/card';

import CopyDid from '@/config/CopyDid';
import { DataTypeAttributes } from '@/features/organization/connectionIssuance/type/Issuance';

interface IProps {
	schemaName: string;
	version: string;
	credDefId?: string;
	schemaId: string;
	hideCredDefId?: boolean;
	schemaAttributes?:DataTypeAttributes[] | undefined;
}

const SummaryCard = ({ schemaName, version, credDefId, schemaId, hideCredDefId, schemaAttributes }: Readonly<IProps>) => {
	return (
		<Card className='my-6'>
			<CardContent>
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
					<div className="truncate dark:text-white break-all flex relative items-center">
						<span className="font-semibold mr-2"><b>Schema ID:</b> </span>
						<span className=''>
							<CopyDid value={schemaId || ""}  />
						</span>
					</div>
					<span className="font-semibold mr-2">
						<b>Attributes:</b>
					</span>

					<div className="flex flex-wrap overflow-hidden">
						{
							schemaAttributes?.map((element: {attributeName:string}) => (
								<div key={element.attributeName} className="truncate">
									<span className="m-1 bg-primary text-custom-900 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-primary-50 dark:text-custom-900">
										{element.attributeName}
									</span>
								</div>
							))
						}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default SummaryCard;
