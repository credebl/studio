'use client';

import { AlertComponent } from '@/components/AlertComponent';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import React from 'react';

interface IProps {
  openModal: boolean;
  closeModal: (flag: boolean) => void;
  onSuccess: (flag: boolean) => void;
  message: React.ReactNode;
  isProcessing: boolean;
  success: string | null;
  failure: string | null;
  setFailure: (flag: string | null) => void;
  setSuccess: (flag: string | null) => void;
  buttonTitles: string[];
  loading: boolean;
  warning?: string;
}

const ConfirmationModal = ({
  openModal,
  closeModal,
  onSuccess,
  message,
  isProcessing,
  success,
  failure,
  setFailure,
  setSuccess,
  buttonTitles,
  loading,
  warning
}: IProps) => {
  return (
    <Dialog open={openModal} onOpenChange={closeModal}>
      <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto dark:bg-gray-800'>
        <DialogHeader>
          <DialogTitle className='text-center'>
            <div className='mx-auto mb-4 h-12 w-12 text-yellow-300 dark:text-yellow-300'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='100%'
                height='100%'
                fill='none'
                viewBox='0 0 22 22'
              >
                <path
                  fill='currentColor'
                  d='M12.388 21.99c-.916.01-1.82.01-2.743.01-.202-.078-.397-.052-.586-.069...'
                />
                <path fill='#FFFFFF' d='M12.72 7.183c...' />
                <path fill='#FFF' d='M9.989 15.875c...' />
              </svg>
            </div>
            <div className='mb-2 text-lg text-gray-700 dark:text-gray-200'>
              {message}
            </div>
            {warning && <div className='text-[#C27803]'>{warning}</div>}
          </DialogTitle>
        </DialogHeader>

        {(success || failure) && (
          <div className='w-full space-y-4'>
            {success && (
              <AlertComponent
                message={success}
                type='success'
                onAlertClose={() => setSuccess(null)}
              />
            )}
            {failure && (
              <AlertComponent
                message={failure}
                type='failure'
                onAlertClose={() => setFailure(null)}
              />
            )}
          </div>
        )}

        <DialogFooter className='mt-6 flex flex-col justify-around gap-4 sm:flex-row'>
          <Button
            variant='outline'
            onClick={() => closeModal(false)}
            className='sm:min-w-[197px]'
          >
            {buttonTitles[0]}
          </Button>
          <Button
            type='submit'
            onClick={() => onSuccess(true)}
            disabled={isProcessing || loading}
            className='sm:min-w-[197px]'
          >
            {isProcessing ? 'Processing...' : buttonTitles[1]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
