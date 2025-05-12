import { Button } from "@/components/ui/button";
import { Label } from "flowbite-react";
import { Field, Form, Formik } from "formik";
import { useState } from "react";
import * as yup from 'yup';
import DedicatedLedgerConfig from "./DedicatedAgentLedgerConfig";
import { useRouter } from "next/navigation";
import { IDedicatedAgentForm } from "../organization/components/interfaces/organization";
import { ArrowLeft } from "lucide-react";


const DedicatedAgentForm = ({
	ledgerConfig, 
  maskedSeeds,
	setLedgerConfig,  
  seeds,
  loading,
  submitDedicatedWallet,
  setAgentConfig
}: IDedicatedAgentForm) => {

    const router = useRouter();
  
  return (
	  <div className="mt-4 flex-col gap-4">
      {!ledgerConfig && (
		  <Formik
          initialValues={{ walletName: '', agentEndpoint: '', apiKey: '' }}
          validationSchema={yup.object().shape({
			  walletName: yup.string().required('Wallet name is required'),
            agentEndpoint: yup.string().required('Agent Endpoint is required'),
            apiKey: yup.string().required('API Key is required'),
		})}
    onSubmit={(values) => {
      setAgentConfig({
        walletName: values.walletName,
        agentEndpoint: values.agentEndpoint,
        apiKey: values.apiKey
      });
      setLedgerConfig(true);
    }}
        >
          {(formikHandlers) => (
			  <Form className="mt-4 max-w-lg">
              <div className="mb-4">
                <label htmlFor="walletName" value="Wallet Name" />
                
                <Field
                  id="walletName"
                  name="walletName"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 w-full dark:bg-gray-700"
                  type="text"
                  placeholder="Enter wallet name"
				  />
                {formikHandlers.errors.walletName && formikHandlers.touched.walletName && (
                  <span className="text-red-500 text-xs">{formikHandlers.errors.walletName}</span>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="agentEndpoint" value="Agent Endpoint" />
                <Field
                  id="agentEndpoint"
                  name="agentEndpoint"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 w-full dark:bg-gray-700"
                  type="text"
                  placeholder="https://agent.example.com"
                />
                {formikHandlers.errors.agentEndpoint && formikHandlers.touched.agentEndpoint && (
                  <span className="text-red-500 text-xs">{formikHandlers.errors.agentEndpoint}</span>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="apiKey" value="API Key" />
                <Field
                  id="apiKey"
                  name="apiKey"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 w-full dark:bg-gray-700"
                  type="text"
                  placeholder="Enter API key"
                />
                {formikHandlers.errors.apiKey && formikHandlers.touched.apiKey && (
                  <span className="text-red-500 text-xs">{formikHandlers.errors.apiKey}</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-6">
              <Button
                    variant='secondary'
                    onClick={() => router.push('/organizations/create-organization?createOrg=true')}
                    className='flex items-center gap-2'
                    >
                    <ArrowLeft className='h-4 w-4' />
                    Back to Create Organization                   
            </Button>
            
            
              <Button
                type="submit"

              >
                Continue to Ledger Setup
              </Button>
              </div>
             
            </Form>
          )}
        </Formik>
      )}

      {ledgerConfig && (
        <DedicatedLedgerConfig
          seeds={seeds}
          // walletName={walletName}
          maskedSeeds={maskedSeeds}
          // agentEndpoint={agentEndpoint}
          // apiKey={apiKey}
          submitDedicatedWallet={submitDedicatedWallet} ledgerConfig={false} setLedgerConfig={function (value: boolean): void {
            throw new Error("Function not implemented.");
          } } loading={false} setAgentConfig={undefined} onConfigureDedicated={function (): void {
            throw new Error("Function not implemented.");
          } }        />
      )}
    </div>
  );
};

export default DedicatedAgentForm;