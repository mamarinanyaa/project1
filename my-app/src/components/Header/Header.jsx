import Container from "../Container/Container";
import Choice from "./Choice/Choice";
import style from "./Header.module.css";

const Header = () => (
    <header className={style.header}>
        <Container>
            <div className={style.wrapper}>
                <div className={style.buttons}>
                    <button className={style.button}>Поменять поздравление</button>
                    <button className={style.button}>Поменять фон</button>
                </div>
                <Choice/>
            </div>
        </Container>
    </header>
);

export default Header