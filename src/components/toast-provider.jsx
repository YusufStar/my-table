'use client'
import {ToastContainer} from "react-toastify";
import {useTheme} from "next-themes";
import 'react-toastify/dist/ReactToastify.css'

const ToastProvider = ({ children }) => {
    // @ts-ignore
    const { theme } = useTheme()

    return (
            <div>
               <ToastContainer className="text-xs font-semibold" theme={theme}/>
                {children}
            </div>
        )
}

export default ToastProvider