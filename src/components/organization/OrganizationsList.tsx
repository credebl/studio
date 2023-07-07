import * as yup from "yup"

import { Avatar, Button, Label, Modal } from 'flowbite-react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { IMG_MAX_HEIGHT, IMG_MAX_WIDTH, apiStatusCodes, imageSizeAccepted } from '../../config/CommonConstant'
import { calculateSize, dataURItoBlob } from "../../utils/CompressImage";
import { useRef, useState } from "react";

import type { AxiosResponse } from 'axios';
import { asset } from '../../lib/data.js';
import { createOrganization } from "../../services/organization";

const OrganizationsList = () => {

    return (
    <h2>Organization List</h2>
    )
}

export default OrganizationsList;