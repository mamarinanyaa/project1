import { useContext } from 'react';
import { textContext } from '../../../context/textContext';
import style from './Felicitation.module.css';

const Felicitation = () => {
    const {text} = useContext(textContext);

    return (
        <p className={style.felicitation}>
           {text || 'Выберите праздник'}
        </p>
    )
};

export default Felicitation;