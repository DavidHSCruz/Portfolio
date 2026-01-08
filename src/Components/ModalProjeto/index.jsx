import styles from './ModalProjeto.module.css';
import { FaTimes, FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { TbLockFilled } from "react-icons/tb";
import { Link } from 'react-router-dom';

export default function ModalProjeto({ project, onClose }) {
    if (!project) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose} aria-label="Fechar modal">
                    <FaTimes />
                </button>
                
                <div 
                    className={styles.image} 
                    style={{backgroundImage: `url(${!project.private ? project.image : `/imagens/Projetos/${project.name}.png`})`}}
                >
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <h2>{project.name}</h2>
                        {project.private && <TbLockFilled className={styles.lockIcon} title="Repositório Privado" />}
                    </div>

                    <p className={styles.description}>{project.description}</p>

                    <div className={styles.tags}>
                        {project.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.links}>
                            {project.url && (
                                <Link to={project.url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                                    <FaGithub /> Ver no GitHub
                                </Link>
                            )}
                            {project.homepage && (
                                <Link to={project.homepage} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                                    <FaExternalLinkAlt /> Ver Projeto
                                </Link>
                            )}
                        </div>
                        <span className={styles.date}>
                            Atualizado em: {new Date(project.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
