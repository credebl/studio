import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ISchema,
  ISchemaAttributeData,
  ISelectedAttributes,
  IW3CSchemaAttributeItem,
  LocalOrgs,
  SelectedUsers
} from '@/features/verification/type/interface';

interface VerificationState {
  schemaAttributes: ISchemaAttributeData[];
  selectedSchemas: ISchema[];
  orgId: string;
  routeType: string;
  schemaId: string[] | null;
  attributeData: ISelectedAttributes[];
  selectedConnections: LocalOrgs[];
  selectedUser: SelectedUsers[];
  w3cSchemaAttributes: IW3CSchemaAttributeItem[];
}

const initialState: VerificationState = {
  schemaAttributes: [],
  selectedSchemas: [],
  orgId: '',
  routeType: '',
  schemaId: null,
  attributeData: [],
  selectedConnections: [],
  selectedUser: [],
  w3cSchemaAttributes: []
};

const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    setSchemaAttributes(state, action: PayloadAction<ISchemaAttributeData[]>) {
      state.schemaAttributes = action.payload;
    },
    setSelectedSchemasData(state, action: PayloadAction<ISchema[]>) {
      state.selectedSchemas = action.payload;
    },
    setOrgId(state, action: PayloadAction<string>) {
      state.orgId = action.payload;
    },
    setVerificationRouteType(state, action: PayloadAction<string>) {
      state.routeType = action.payload;
    },
    setSchemaId(state, action: PayloadAction<string[]>) {
      state.schemaId = action.payload;
    },
    setSelectedAttributeData(
      state,
      action: PayloadAction<ISelectedAttributes[]>
    ) {
      state.attributeData = action.payload;
    },
    setSelectedConnections(state, action: PayloadAction<LocalOrgs[]>) {
      state.selectedConnections = action.payload;
    },
    setSelectedUser(state, action: PayloadAction<SelectedUsers[]>) {
      state.selectedUser = action.payload;
    },
    setW3CSchemaAttributes(
      state,
      action: PayloadAction<IW3CSchemaAttributeItem[]>
    ) {
      state.w3cSchemaAttributes = action.payload;
    },
    resetVerificationState(state) {
      state.schemaAttributes = [];
      state.selectedSchemas = [];
      state.orgId = '';
      state.routeType = '';
      state.schemaId = null;
      state.attributeData = [];
      state.selectedConnections = [];
      state.selectedUser = [];
      state.w3cSchemaAttributes = [];
    }
  }
});

export const {
  setSchemaAttributes,
  setSelectedSchemasData,
  setOrgId,
  setVerificationRouteType,
  setSchemaId,
  setSelectedAttributeData,
  setSelectedConnections,
  setSelectedUser,
  resetVerificationState,
  setW3CSchemaAttributes
} = verificationSlice.actions;

export default verificationSlice.reducer;
