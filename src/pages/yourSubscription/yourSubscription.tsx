import React from "react";

const YourSubscription = () => {
    return (
        <div className="py-8 px-4 mx-auto max-w-xl lg:py-6 lg:px-6">
       
        <div className="space-y-8 sm:gap-6 xl:gap-10 lg:space-y-0">
            <div className="flex justify-center">
            
            <div className="flex flex-col p-6 mx-auto max-w-xxxl text-center text-gray-900 bg-white rounded-lg border-t-8 border-white  shadow-[0_0_20px_0px] shadow-blue-700/50 dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                
                <h3 className="mb-4 text-2xl font-semibold">Free</h3>
                {/* <div className="flex justify-center items-baseline my-8">
                <span className="mr-2 text-5xl font-extrabold">$0</span>
                  <span className="text-gray-500">/month</span>
                </div> */}
                
                <ul role="list" className="mb-8 space-y-4 text-left">
                    <li className="flex items-center space-x-3">
                        <span>Org Creation: <span className="font-semibold"> 2 </span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Wallet Creation: <span className="font-semibold">1 Wallet per Org</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Schema: <span className="font-semibold">5/Org</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Cred-def: <span className="font-semibold">2/Schema</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>User: <span className="font-semibold">5/Org</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Credential Issuance: <span className="font-semibold">500/Org</span></span>
                    </li>
                    <li className="flex items-center space-x-3">                       
                        <span>Credential Verification: <span className="font-semibold">500/Org</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Bulk Issuance: <span className="font-semibold">5 Issuance at a time</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Bulk Verification: <span className="font-semibold">5 Verification at a time</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Network: <span className="font-semibold">TestNet(Indico,Bitcorvin)</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Agent: <span className="font-semibold">Multi-tenant Shared agent</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Mobile App: <span className="font-semibold">Unlimited Installations</span></span>
                    </li>
                    <li className="flex items-center space-x-3">
                        <span>Technical Support: <span className="font-semibold">Community</span></span>
                    </li>
                </ul>
                
                <a href="#" className="text-primary-700 bg-white  focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white border border-primary-700 dark:focus:ring-primary-900">Upgrade To Pro</a>
            </div>
            </div>
            </div>
            </div>
    )
}

export default YourSubscription;