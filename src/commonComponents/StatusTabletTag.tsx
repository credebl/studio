import { EndorsementStatus } from "../common/enums"

interface IStatusTabletTag {
    status: string
}

const StatusTabletTag = ({ status }: IStatusTabletTag) => {
    const color = () => {
        switch (true) {
            case status === EndorsementStatus.signed:
                return {
                    style: `bg-[#fca20033] text-[#FCA200]`,
                    title: "Accepted"
                }
            case status === EndorsementStatus.rejected:
                return {
                    style: `bg-[#FFE4E4] text-[#EA5455]`,
                    title: "Rejected"
                }
            case status === EndorsementStatus.requested:
                return {
                    style: `bg-[#1f4ead33] text-[#1F4EAD]`,
                    title: "Requested"
                }
            case status === EndorsementStatus.submited:
                return {
                    style: `bg-[#70ffa01a] text-[#28C76F]`,
                    title: "Submitted"
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