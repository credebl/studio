import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CircleCheck } from "lucide-react";

interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	isProcessing: boolean;
}

const IssuancePopup = (props: IProps) => {
	return (
		<Modal title="" description="" className="dark:bg-gray-700 m-0 p-0" isOpen={props.openModal} onClose={()=>{props.closeModal(false)}}>
			<div className="relative w-full max-w-xl max-h-full">
				<div className="relative bg-white rounded-lg  dark:bg-gray-700">
					<div className="p-6 text-center">
						<CircleCheck size={80} color="var(--primary)" className="m-auto"/>						
						<p className="text-3xl text-primary dark:text-primary/80 mb-4">Confirmation</p>
						<h3 className="mb-6 text-xl font-normal text-gray-500 dark:text-gray-400">
						Are you sure you want to <span className='text-primary-900 dark:text-primary-700'> Offer</span> Credentials ?
						</h3>

						<div className="flex justify-center">
							<Button
								data-modal-hide="popup-modal"
								type="button"
								className="flex justify-center items-center text-red-500 dark:text-red-500 bg-white hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-red-200 rounded-lg border border-red-500 dark:border-red-500 text-lg px-5 py-2.5 mr-8 hover:text-red-600 focus:z-10 dark:bg-gray-700 dark:hover:text-red:700 dark:hover:bg-gray-600 dark:focus:ring-red-600"
								onClick={() => {
									props.closeModal(false);
								}}
							>
								No, Cancel
							</Button>
							<Button
								type="submit"
								// isProcessing={props.isProcessing}
								disabled={props.isProcessing}
								onClick={() => {
									props.onSuccess(true);
									window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
								}}
								className="bg-primary hover:!bg-primary/90  focus:outline-none focus:ring dark:bg-primary-700 dark:hover:bg-primary/90 dark:focus:ring-primary rounded-lg inline-flex items-center text-center ml-2 text-custom-900"
							>  
								<p className="text-lg font-normal">Yes, I'm sure</p>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default IssuancePopup;
