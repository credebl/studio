'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookmarkIcon, UserCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { editOrganizationUserRole, getOrganizationRoles } from '@/app/api/organization';
import { useEffect, useState } from 'react';

import { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TextTitlecase } from '@/utils/TextTransform';
import { User } from './users-interface';
import { apiStatusCodes } from '@/config/CommonConstant';
import { useAppSelector } from '@/lib/hooks';

interface RoleI {
  id: string;
  name: string;
  checked: boolean;
  disabled: boolean;
}

interface EditUserRoleModalProps {
  openModal: boolean;
  user: User;
  setMessage: (message: string) => void;
  setOpenModal: (flag: boolean) => void;
}

const EditUserRoleModal = ({ openModal, user, setMessage, setOpenModal }: EditUserRoleModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<RoleI[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const orgId = useAppSelector((state) => state.organization.orgId);
  const getRoles = async () => {
    try {
      const response = await getOrganizationRoles(orgId);
      
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const fetchedRoles: Array<RoleI> = data.data;
        const filteredRoles = fetchedRoles.map((role) => {
            if (user?.roles.includes(role.name) && role.name !== 'member') {
              return { ...role, checked: true, disabled: false };
            } else if (role.name === 'member') {
              return { ...role, checked: true, disabled: true };
            } else {
              return { ...role, checked: false, disabled: false };
            }
          });
          
        
        setRoles(filteredRoles);
      } else {
        setErrorMsg(response as unknown as string);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setErrorMsg('Failed to fetch roles');
    }
  };

  useEffect(() => {
    if (openModal) {
      getRoles();
    }
  }, [openModal, user]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const roleIds = roles?.filter(role => role.checked).map(role => role.id);
      const response = await editOrganizationUserRole(user.id, roleIds as string[], orgId);

      if (response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setMessage(response.data.message);
        setOpenModal(false);
      } else {
        setErrorMsg(response as unknown as string);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setErrorMsg('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (checked: boolean, role: RoleI) => {
    if (
      (role.name === 'issuer' && checked === true) || 
      (role.name === 'verifier' && checked === true)
    ) {
      const updatedRoles = roles?.map(r => {
        if (r.id === role.id) {
          return { ...r, checked };
        } else if (
          (r.name === 'verifier' && r.checked) ||
          (r.name === 'issuer' && r.checked) ||
          (r.name === 'member' && r.checked)
        ) {
          return { ...r, checked: true };
        } else {
          return { ...r, checked: false };
        }
      });
      setRoles(updatedRoles ?? null);
    } 
    else if (role.name === 'admin' && checked === true) {
      const updatedRoles = roles?.map(r => {
        if (r.id === role.id) {
          return { ...r, checked };
        } else if (r.name === 'member' && r.checked) {
          return { ...r, checked: true };
        } else {
          return { ...r, checked: false };
        }
      });
      setRoles(updatedRoles ?? null);
    } 
    else {
      const updatedRoles = roles?.map(r => {
        if (r.id === role.id) {
          return { ...r, checked };
        }
        return r;
      });
      setRoles(updatedRoles ?? null);
    }
  };
  
  const getRoleColor = (roleName: string) => {
    switch(roleName) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'member':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'issuer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'verifier':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-md rounded-xl shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center text-primary">
            <UserCircle className="mr-2 h-5 w-5" />
            Manage User Role
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200 shadow-sm p-5 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center border-b pb-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                  <UserCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-grow">
                  <p className="text-base font-semibold text-gray-800 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                </div>
              </div>

              <div className="w-full">
                <div className="text-sm font-medium mb-3 flex items-center">
                  <span className="mr-1">Assigned Roles</span>
                  <span className="text-red-500">*</span>
                </div>
                
                {roles && (
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div 
                        key={role.id} 
                        className={`flex items-center p-3 rounded-md transition-all ${
                          role.checked 
                            ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        } ${role.checked && !role.disabled ? 'ring-2 ring-primary/20' : ''}`}
                        onClick={() => !role.disabled && handleRoleChange(!role.checked, role)}
                      >
                        <Checkbox
                          id={`checkbox-${role.id}`}
                          checked={role.checked}
                          disabled={role.disabled}
                          onCheckedChange={(checked) => 
                            handleRoleChange(checked as boolean, role)
                          }
                          className={`h-5 w-5 rounded border-2 ${
                            role.checked ? 'border-primary bg-primary text-primary-foreground' : 
                            role.disabled ? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700' : 
                            'border-gray-400 dark:border-gray-500'
                          } mr-3`}
                        />
                        <div className="flex flex-grow items-center justify-between">
                          <Label 
                            htmlFor={`checkbox-${role.id}`}
                            className={`${role.disabled ? 'text-gray-500' : 'font-medium'} cursor-pointer`}
                          >
                            {TextTitlecase(role.name)}
                          </Label>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(role.name)}`}>
                            {TextTitlecase(role.name)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setOpenModal(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <BookmarkIcon className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserRoleModal;