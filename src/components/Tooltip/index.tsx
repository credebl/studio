import { Tooltip } from 'flowbite-react';
import moment from 'moment';
import { dateConversion } from '../../utils/DateConversion';
import type { ChildrenType } from 'react-tooltip';
import { useEffect } from 'react';

interface DateProps {
  date: string
  id?: string
  children?: any
}

const DateTooltip = ({date, children}: DateProps) => {


  const updatedDate = new Date(date);
  const formattedDate = date ? moment(updatedDate).format("MMM DD, YYYY, h:mm A z") : '';


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