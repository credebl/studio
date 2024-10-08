import { useEffect, useState } from 'react';

import { Tooltip } from 'flowbite-react';
import moment from 'moment';

interface DateProps {
  date: string
  id?: string
  children?: any
}

const DateTooltip = ({date, children}: DateProps) => {
  const [formattedDate,setFormattedDate]= useState("")

  
  useEffect(() => {
    const updatedDate = new Date(date);
    const formatdDate = date ? moment(updatedDate).format("MMM DD, YYYY, h:mm A z") : '';
    setFormattedDate(formatdDate)
  }, [])

  return (
    <Tooltip 
      content= {formattedDate} 
      placement="top">
      {
        children
      }
    </Tooltip>
  )
}

export default DateTooltip