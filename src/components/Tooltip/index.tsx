import { Tooltip } from 'flowbite-react';
import moment from 'moment';
import { dateConversion } from '../../utils/DateConversion';
import type { ChildrenType } from 'react-tooltip';

interface DateProps {
  date?: Date
  id?: string
  children?: any
}

const DateTooltip = ({date, children}: DateProps) => {

  const formattedDate = date ? moment(date).format("MMM DD, YYYY, h:mm A z") : '';

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