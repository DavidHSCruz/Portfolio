import { useEffect, useRef, useState } from 'react'
import styles from './Menu.module.css'
import { FaLinkedin, FaGithub } from "react-icons/fa"
import { BiAdjust } from "react-icons/bi"
import LinkDestacado from 'Components/LinkDestacado'
import { ModalContato } from 'Components/ModalContato'
import { Logo } from 'Components/Logo/index'
import gsap from 'gsap'
import ChatAgent from 'Components/ChatAgent'

export default function Menu() {
    const listMenu = [ 'HOME', 'PROJETOS', 'SOBRE MIM' ]
    const tema__localStorage = JSON.parse(localStorage.getItem('tema__noturno'))
    const [noturno, setNoturno] = useState(tema__localStorage)
    const icon__tema = useRef(null)
    const [ contatoAberto, setContatoAberto ] = useState(false)

    const ran = useRef(false)

    
    useEffect(() => {
        const isTelaDark = JSON.parse(localStorage.getItem('tema__noturno'))
        if(isTelaDark) document.documentElement.classList.add('dark')
            
        if(ran.current) return
        ran.current = true

        gsap.to(`.${styles.navegacao}>ul li`, { y: 0, opacity: 1, stagger: .2, delay: 1 })
    }, [])

    function mudarTema() {
        localStorage.setItem('tema__noturno', !noturno)
        setNoturno(!noturno)
        document.documentElement.classList.toggle('dark')
    }

    return(
        <header className={styles.menu}>
            <section className={styles.menuComponent}>
                
                <Logo />
            
                <nav className={styles.navegacao}>
                    <ul>
                        {
                            listMenu.map( (item, index) => (
                                <li key={ index }>
                                    <LinkDestacado
                                        key={ index }
                                        to={ item === 'HOME' ? '' : item.toLowerCase().replace(/\s+/g, '') }
                                    >
                                        { item }</LinkDestacado>
                                </li>
                            ))
                        }
                            <li onClick={() => setContatoAberto(true)}>
                                <p>CONTATO</p>
                            </li>
            
                        <ul className={styles.redes_sociais}>
                            <li>
                                <a 
                                    href='https://github.com/DavidHSCruz'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    area-label='Abrir perfil do github'
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
            
                    </ul>
                </nav>

                <button 
                    className={styles.botao_altera_tema}
                    type="button"
                    aria-label='Alterar tema'
                    onClick={ mudarTema }
                >
                    <BiAdjust
                        ref={icon__tema}
                        className={styles.icon_tema}
                    />
                </button>
            </section>

            <ModalContato contatoAberto={contatoAberto} setContatoAberto={setContatoAberto} />
            <div>
                <ChatAgent />
            </div>

        </header>
    )
}