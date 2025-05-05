/* eslint-disable max-lines */
import { apiRoutes } from '@/config/apiRoutes';
import { getHeaderConfigs } from '@/config/GetHeaderConfigs';
import { IDedicatedAgentConfiguration } from '@/features/organization/components/interfaces/organization';
import {   axiosDelete, axiosGet, axiosPost, axiosPut, ecosystemAxiosPost } from '@/services/apiRequests';


// TODO: Uncomment the following lines when the API is ready
export const createOrganization = async (data: object) => {
  const url = apiRoutes.organizations.create;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const updateOrganization = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.update}/${orgId}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizations = async (
  pageNumber: number,
  pageSize: number,
  search = '',
  role = ''
) => {
  const roleQuery = role ? `&role=${role}` : '';
  const url = `${apiRoutes.organizations.getAll}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}${roleQuery}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationById = async (orgId: string) => {
  const url = `${apiRoutes.organizations.getById}/${orgId}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrgDashboard = async (orgId: string) => {
  const url = `${apiRoutes.organizations.getOrgDashboard}/${orgId}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const spinupDedicatedAgent = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentDedicatedSpinup}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const setAgentConfigDetails = async (data: IDedicatedAgentConfiguration, orgId: string) => {
	const url =`${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.setAgentConfig}`
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const payload = data;

	const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const spinupSharedAgent = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentSharedSpinup}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationRoles = async () => {
  const orgId = '';
  const url = `${apiRoutes.organizations.root}/${orgId}/roles`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getOrganizationReferences = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}${apiRoutes.organizations.getOrgReferences}/${orgId}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };
  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const deleteVerificationRecords = async (orgId: string) => {

  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteVerifications}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };
  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const deleteIssuanceRecords = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteIssaunce}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };
  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const deleteOrganizationWallet = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.deleteWallet}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };
  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const deleteOrganization = async (orgId:string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}`;
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };
  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

  export const getAllCountries = async () => {
    const url = `${apiRoutes.geolocation.countries}`;
  
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const axiosPayload = {
      url,
      config
    };
  
    try {
      return await axiosGet(axiosPayload);
    } catch (error) {
      const err = error as Error;
      return err?.message;
    }
  };
  

export const getAllStates = async(countryId:number | null) => {
	const url = `${apiRoutes.geolocation.countries}/${countryId}${apiRoutes.geolocation.state}`;
  
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const axiosPayload = {
      url,
      config
    };
  
    try {
      return await axiosGet(axiosPayload);
    } catch (error) {
      const err = error as Error;
      return err?.message;
    }
  };

export const getAllCities = async(countryId:number | null, stateId:number | null) => {
	const url = `${apiRoutes.geolocation.countries}/${countryId}${apiRoutes.geolocation.state}/${stateId}${apiRoutes.geolocation.cities}`;
  
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const axiosPayload = {
      url,
      config
    };
  
    try {
      return await axiosGet(axiosPayload);
    } catch (error) {
      const err = error as Error;
      return err?.message;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const createDid = async (orgId:string, payload: any) => {
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.createDid}`;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};


export const getLedgerConfig = async () => {
    const url = `${apiRoutes.organizations.root}${apiRoutes.Agent.getLedgerConfig}`;
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const axiosPayload = {
      url,
      config
    };
  
    try {
      return await axiosGet(axiosPayload);
    } catch (error) {
      const err = error as Error;
      return err?.message;
    }
  };
  
  

export const getLedgers = async () => {
     const  url = `${apiRoutes.Platform.getLedgers}`;
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const axiosPayload = {
        url,
        config
      };
    
      try {
        return await axiosGet(axiosPayload);
      } catch (error) {
        const err = error as Error;
        return err?.message;
      }
    };
    
    export const createPolygonKeyValuePair = async (orgId:string) => {
       const url =`${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.createPolygonKeys}`;
        const config = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const axiosPayload = {
          url,
          config
        };
      
        try {
          return await axiosPost(axiosPayload);
        } catch (error) {
          const err = error as Error;
          return err?.message;
        }
      };
      

      // export const createConnection = async (orgName: string) => {
      //   const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.connection.create}`;
      
      //   const data = {
      //     label: orgName,
      //     multiUseInvitation: true,
      //     autoAcceptConnection: true,
      //     orgId: orgId,
      //   };
      //   const payload = data;
      
      //   const axiosPayload = {
      //     url,
      //     payload,
      //     config: await getHeaderConfigs(),
      //   };
      
      //   try {
      //     return await axiosPost(axiosPayload);
      //   } catch (error) {
      //     const err = error as Error;
      //     return err?.message;
      //   }
      // };
      
// //Get users of the organization
// export const getOrganizationUsers = async (
// 	pageNumber: number,
// 	pageSize: number,
// 	search = '',
// ) => {
// 	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
// 	if (!orgId) {
// 		return 'Organization is required';
// 	}

// 	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.users.fetchUsers}?&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

// 	const axiosPayload = {
// 		url,
// 		config: await getHeaderConfigs(),
// 	};

// 	try {
// 		return await axiosGet(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// // Edit user roles
// export const editOrganizationUserRole = async (
// 	userId: string,
// 	roles: string[],
// ) => {
// 	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

// 	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.editUserROle}/${userId}`;
// 	const payload = {
// 		orgId,
// 		userId,
// 		orgRoleId: roles,
// 	};

// 	const axiosPayload = {
// 		url,
// 		payload,
// 		config: await getHeaderConfigs(),
// 	};

// 	try {
// 		return axiosPut(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// //Create Connection

// export const createConnection = async (orgName: string) => {
// 	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
// 	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.connection.create}`;

// 	const data = {
// 		label: orgName,
// 		multiUseInvitation: true,
// 		autoAcceptConnection: true,
// 		orgId: orgId,
// 	};
// 	const payload = data;

// 	const axiosPayload = {
// 		url,
// 		payload,
// 		config: await getHeaderConfigs(),
// 	};

// 	try {
// 		return await axiosPost(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// // public profile

// export const getPublicOrganizations = async (
// 	pageNumber: number,
// 	pageSize: number,
// 	search: string,
// ) => {
// 	const url = `${apiRoutes.Public.organizations}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

// 	const config = {
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	};
// 	const axiosPayload = {
// 		url,
// 		config,
// 	};

// 	try {
// 		return await axiosPublicOrganisationGet(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// export const getPublicOrgDetails = async (orgSlug: string) => {
// 	const url = `${apiRoutes.Public.organizationDetails}/${orgSlug}`;

// 	const config = {
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	};
// 	const axiosPayload = {
// 		url,
// 		config,
// 	};

// 	try {
// 		return await axiosPublicOrganisationGet(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// // Edit user roles
// export const deleteOrganizationInvitation = async (
// 	orgId: string,
// 	invitationId: string,
// ) => {
// 	const url = `${apiRoutes.organizations.root}/${orgId}/invitations/${invitationId}`;

// 	const axiosPayload = {
// 		url,
// 		config: await getHeaderConfigs(),
// 	};

// 	try {
// 		return await axiosDelete(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// export const getDids = async (orgId: string) => {
// 	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didList}`;

// 	const token = await getFromLocalStorage(storageKeys.TOKEN);

// 	const config = {
// 		headers: {
// 			'Content-Type': 'application/json',
// 			Authorization: `Bearer ${token}`,
// 		},
// 	};
// 	const axiosPayload = {
// 		url,
// 		config,
// 	};

// 	try {
// 		return await axiosGet(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };



// export const updatePrimaryDid = async (orgId: string, payload: IUpdatePrimaryDid) => {
// 	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.primaryDid}`;

// 	const axiosPayload = {
// 		url,
// 		payload,
// 		config: await getHeaderConfigs(),
// 	};

// 	try {
// 		return await axiosPut(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// 	try {
// 		return await axiosGet(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

// export const getEcosystems = async (
// 	orgId: string,
// 	pageNumber: number = 1,
// 	pageSize: number = 10,
// 	search = '',
// ) => {
// 	const url = `${apiRoutes.Ecosystem.root}/${orgId}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;
// 	const axiosPayload = {
// 		url,
// 		config: await getHeaderConfigs(),
// 	};

// 	try {
// 		return await ecosystemAxiosGet(axiosPayload);
// 	} catch (error) {
// 		const err = error as Error;
// 		return err?.message;
// 	}
// };

export const createSchemaRequest = async (
	data: object,
	// endorsementId: string,
	orgId: string,
) => {
	// const url = `${apiRoutes.Ecosystem.root}/${endorsementId}/${orgId}${apiRoutes.Ecosystem.endorsements.createSchemaRequest}`;
	const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.endorsements.createSchemaRequest}`;
	const payload = data;
	const axiosPayload = {
		url,
		payload,
		config: await getHeaderConfigs(),
	};

	try {
		return await ecosystemAxiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};
