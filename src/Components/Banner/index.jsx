import { Avatar } from 'Components/Avatar'
import styles from './Banner.module.css'
import { IoLogoCss3, IoLogoHtml5, IoLogoJavascript, IoLogoNodejs } from "react-icons/io"
import { IoLogoReact, IoLogoDocker, IoLogoGithub } from "react-icons/io5"
import { SiTypescript, SiTailwindcss, SiPostgresql, SiJest, SiNestjs } from "react-icons/si"

export default function Banner() {
    const icons = [
        { Icon: IoLogoHtml5, name: "HTML5" },
        { Icon: IoLogoCss3, name: "CSS3" },
        { Icon: IoLogoJavascript, name: "JavaScript" },
        { Icon: SiTypescript, name: "TypeScript" },
        { Icon: IoLogoReact, name: "React" },
        { Icon: IoLogoNodejs, name: "Node.js" },
        { Icon: SiNestjs, name: "NestJS" },
        { Icon: SiTailwindcss, name: "Tailwind" },
        //{ Icon: SiPostgresql, name: "PostgreSQL" },
        { Icon: IoLogoDocker, name: "Docker" },
        //{ Icon: SiJest, name: "Jest" },
        { Icon: IoLogoGithub, name: "GitHub" },
    ];

    return(
        <section className={styles.bannerContainer}>
            <div className={styles.inicio_esquerda}>
                <div className={styles.contentWrapper}>
                    <h1 className={styles.title}>OLÁ!</h1>
                    <h2 className={styles.subtitle}>
                        Eu sou David Cruz.<br />
                        Desenvolvedor Full Stack apaixonado por criar experiências digitais únicas.
                    </h2>
                    <div className={styles.tecnologias}>
                        {icons.map((item, index) => (
                            <div key={index} className={styles.iconWrapper} style={{animationDelay: `${index * 100}ms`}} title={item.name}>
                                <item.Icon />
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            <div className={styles.inicio_direita}>
                <div className={styles.avatarWrapper}>
                    <Avatar />
                </div>
            </div>
        </section>
    )
}