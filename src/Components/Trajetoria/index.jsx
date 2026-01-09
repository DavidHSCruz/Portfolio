import styles from './Trajetoria.module.css'
import { FaLightbulb, FaPalette, FaCode, FaRocket, FaHistory } from 'react-icons/fa';

export default function Trajetoria({ title }) {
    const steps = [
        {
            icon: <FaCode />,
            title: "O Desenvolvedor de Hoje",
            text: "Atualmente, atuo como Desenvolvedor Full Stack, focado em criar soluções robustas com React, React Native e Node.js (NestJS). Meu dia a dia é transformar requisitos complexos em código limpo, interfaces responsivas e APIs escaláveis."
        },
        {
            icon: <FaHistory />,
            title: "Mas nem sempre foi assim...",
            text: "Minha jornada não começou no mundo do código. Iniciei minha carreira no comércio, onde aprendi na prática o valor da comunicação, liderança e gestão de equipes — habilidades que hoje são fundamentais na minha colaboração com times ágeis."
        },
        {
            icon: <FaPalette />,
            title: "A Bagagem Criativa",
            text: "Antes de mergulhar na lógica, explorei a criatividade. Como Designer Gráfico e Motion Designer, treinei meu olhar para estética e usabilidade. Essa experiência me permite hoje construir interfaces que não apenas funcionam, mas encantam."
        },
        {
            icon: <FaLightbulb />,
            title: "A Convergência",
            text: "A programação surgiu como o elo perdido. Percebi que poderia unir a visão de negócios da minha gestão, a sensibilidade visual do design e a potência da tecnologia. Foi aí que encontrei minha verdadeira vocação."
        },
        {
            icon: <FaRocket />,
            title: "O Futuro",
            text: "Hoje, busco desafios que exijam essa visão multidisciplinar. Quero contribuir em projetos onde eu possa aplicar todo esse background para entregar produtos digitais completos, eficientes e de alto impacto."
        }
    ];

    return(
        <section className={styles.trajetoria}>
            <h2>{title}</h2>
            <div className={styles.timeline}>
                {steps.map((step, index) => (
                    <div key={index} className={styles.container}>
                        <div className={styles.iconBox}>
                            {step.icon}
                        </div>
                        <div className={styles.textBox}>
                            <h3>{step.title}</h3>
                            <p>{step.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}