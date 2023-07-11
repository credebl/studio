import BreadCrumbs from '../BreadCrumbs';

const Dashboard = () => {

    return (
        <div className="px-4 pt-6">

            <div className="mb-4 col-span-full xl:mb-2">

                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Organizations Dashboard
                </h1>
            </div>
        </div>
    )

}

export default Dashboard