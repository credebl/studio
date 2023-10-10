import { EndorsementStatus } from "../common/enums"

interface IStatusTabletTag {
    status: string
}

const StatusTabletTag = ({ status }: IStatusTabletTag) => {
    const color = () => {
        switch (true) {
            case status === EndorsementStatus.approved:
                return {
                    style: `bg-[#70ffa01a] text-[#28C76F]`,
                    title: "Accepted"
                }
            case status === EndorsementStatus.rejected:
                return {
                    style: `bg-[#FFE4E4] text-[#EA5455]`,
                    title: "Rejected"
                }
            case status === EndorsementStatus.requested:
                return {
                    style: `bg-[#EEE] text-[#7D7D7D]`,
                    title: "Requested"
                }
            default:
                return {
                    style: `bg-[#FFE4E4] text-[#EA5455]`,
                    title: "NA"
                }
        }
    }

    const { style, title } = color()

    return (
        <div className={`${style} w-fit py-1.5 px-3 rounded-full`}>
            {title}
        </div>
    )
}

export default StatusTabletTag