import { createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { URI_API } from "../const/const";
import { useFetch } from "../hooks/useFetch";
import { holidaysContext } from "./holidaysContext";

export const imgContext = createContext({});        //контекст состоит из провайдера (чтобы данные записать и их там хранить) и консьюмера (для использования данных)

export const ImgContextProvider = ({children}) => {
    const holiday = useSelector(state => state.holidays.holiday);
    const [{urlImg}] = useFetch(holiday ? `${URI_API}image/${holiday}` : '')
    return (
        <imgContext.Provider value={{urlImg}}>
            {children}
        </imgContext.Provider>
    )
}