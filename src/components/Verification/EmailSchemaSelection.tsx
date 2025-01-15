import React from "react";
import VerificationSchemasList from "./VerificationSchemasList";

const EmailSchemaSelection = ({ routeType }: { routeType: string }) => {
	return (
		<VerificationSchemasList routeType={routeType} />
	)
}

export default EmailSchemaSelection;
