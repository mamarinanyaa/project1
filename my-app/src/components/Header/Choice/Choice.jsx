import { useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { holidaysContext } from '../../../context/holidaysContext';
import style from './Choice.module.css';
import { fetchHolidays, setHoliday } from '../../../store/holidaysSlice';

const Choice = () => {
    const [isOpenChoice, setIsOpenChoice] = useState(false);
    //const [holiday, setHoliday] = useState('Выбрать праздник')
    const { holiday, holidays, loading } = useSelector(state => state.holidays);
    const dispatch = useDispatch();
    // const {holidays} = useContext(holidaysContext)
    
    const toggleChoice = () => {
        if (loading !== 'success') return;
        setIsOpenChoice(!isOpenChoice)
    };

    useEffect(() => {
        dispatch(fetchHolidays());

    }, [dispatch])

    return (
        <div className={style.wrapper}>
            <button className={style.button} onClick={toggleChoice}>{ loading!== 'success' ? 'Загрузка...' : holidays[holiday] || 'Выбрать праздник'}</button>
            {
                isOpenChoice && (
                    <ul className={style.list}>
                        {Object.entries(holidays).map(item => (
                            <li className={style.item} key={item[0]} onClick={() => {
                                dispatch(setHoliday(item[0])) 
                                toggleChoice();
                            }} >{item[1]}</li>
                        ))}
                    </ul>
                )
            }
        </div>
    )
};

export default Choice;