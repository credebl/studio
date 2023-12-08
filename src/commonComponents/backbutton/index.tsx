import { Button } from 'flowbite-react';

const index = ({ path }: { path: string }) => {
	return (
		<div>
			<Button
				type="submit"
				color="bg-primary-800"
				onClick={() => {
					window.location.href = path;
				}}
				className="bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 m-2 ml-2 dark:text-white dark:hover:text-black"
				style={{ height: '2.5rem', width: '5rem', minWidth: '2rem' }}
			>
				<svg
					className="mr-1"
					xmlns="http://www.w3.org/2000/svg"
					width="22"
					height="12"
					fill="none"
					viewBox="0 0 30 20"
				>
					<path
						fill="#1F4EAD"
						d="M.163 9.237a1.867 1.867 0 0 0-.122 1.153c.083.387.287.742.587 1.021l8.572 7.98c.198.19.434.343.696.447a2.279 2.279 0 0 0 1.657.013c.263-.1.503-.248.704-.435.201-.188.36-.41.468-.655a1.877 1.877 0 0 0-.014-1.543 1.999 1.999 0 0 0-.48-.648l-4.917-4.576h20.543c.568 0 1.113-.21 1.515-.584.402-.374.628-.882.628-1.411 0-.53-.226-1.036-.628-1.41a2.226 2.226 0 0 0-1.515-.585H7.314l4.914-4.574c.205-.184.368-.404.48-.648a1.878 1.878 0 0 0 .015-1.542 1.99 1.99 0 0 0-.468-.656A2.161 2.161 0 0 0 11.55.15a2.283 2.283 0 0 0-1.657.013 2.154 2.154 0 0 0-.696.447L.626 8.589a1.991 1.991 0 0 0-.463.648Z"
					/>
				</svg>
				<span className="hidden sm:block">Back</span>
			</Button>
		</div>
	);
};

export default index;
