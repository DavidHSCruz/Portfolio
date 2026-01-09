import styles from './MenuMobile.module.css'
import { FaLinkedin, FaGithub } from "react-icons/fa"
import { BiAdjust } from "react-icons/bi"
import { useEffect, useState } from 'react'
import LinkDestacado from 'Components/LinkDestacado'
import LinkMenuWhatsApp from 'Components/LinkMenuWhatsApp'
import ChatAgent from 'Components/ChatAgent'

export default function Menu() {
    const listMenu = [ 'HOME', 'PROJETOS', 'SOBRE MIM', 'CONTATO' ]
    const tema__localStorage = JSON.parse(localStorage.getItem('tema__noturno'))
    const [noturno, setNoturno] = useState(tema__localStorage)
    const [menuAberto, setMenuAberto] = useState(false)
    const [ contatoAberto, setContatoAberto ] = useState(false)
    
    const numeroWhats = '554199497870'
    const mensagemWhats = 'Olá, adorei seu portfólio, vamos conversar?'

    useEffect(() => {
        const isTelaDark = JSON.parse(localStorage.getItem('tema__noturno'))
        if(isTelaDark) document.documentElement.classList.add('dark')
    }, [])

    function mudarTema() {
        localStorage.setItem('tema__noturno', !noturno)
        setNoturno(!noturno)
        document.documentElement.classList.toggle('dark')
    }

    return(
        <header className={styles.menuMobile}>
            <div
                className={styles.hamburguer}
                onClick={ () => setMenuAberto(!menuAberto) }
            >
                    <span style={{
                        transform: menuAberto && 'translateY(15px) rotate(45deg)',
                    }}></span>
                    <span style={{
                        opacity: menuAberto && 0,
                    }}></span>
                    <span style={{
                        transform: menuAberto && 'translateY(-15px) rotate(-45deg)',
                    }}></span>
            </div>
            <section style={{top: !menuAberto ? '-100vh' : '0px'}}>
                <nav className={styles.navegacao}>
                    <ul>
                        {
                            listMenu.map( (item, index) => (
                                <li key={ index }>
                                    <LinkDestacado
                                        key={ index }
                                        to={ item === 'HOME' ? '' : item.toLowerCase().replace(/\s+/g, '') }
                                        menuAberto={menuAberto}
                                        setMenuAberto={setMenuAberto}
                                        contatoAberto={contatoAberto}
                                        setContatoAberto={setContatoAberto}
                                    >
                                        { item }</LinkDestacado>
                                </li>
                            ))
                        }
            
                        <ul className={styles.redes_sociais}>
                            <li>
                                <a 
                                    href='https://github.com/DavidHSCruz' 
                                    target='_blank' 
                                    rel='noopener noreferrer'
                                    area-label='Abrir perfil do linkedin'
                                >
                                    <FaGithub name="logo-github"/>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href='https://www.linkedin.com/in/david-henrique-silva-cruz-4a0762188/' 
                                    target='_blank' 
                                    rel='noopener noreferrer'
                                    area-label='Abrir perfil do linkedin'
                                >
                                    <FaLinkedin name="logo-linkedin"/>
                                </a>
                            </li>
                        </ul>
                        <button 
                            className={styles.botao_altera_tema}
                            type="button"
                            onClick={ mudarTema }
                        >
                            <BiAdjust className={styles.icon_tema} />
                        </button>
                    </ul>
                </nav>
            </section>
            <div>
                <ChatAgent />
            </div>

        </header>
    )
}