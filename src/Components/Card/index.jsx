import styles from './Card.module.css';
import { TbLockFilled } from "react-icons/tb";

export default function Card({ title, description, tags, img, updated_at, privateRepo, onClick }) {
    
    function maxCharacters(text, n=90) {
        if(text.length <= n) {
            return text;
        }
        return text.substring(0, n) + '...';
    }

    return (
        <div 
            className={styles.card}
            onClick={onClick}
        >
            <div 
                className={styles.img}
                style={{backgroundImage: `url(${img})`}}
            >
            </div>
            <div className={styles.description}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <h3>{title}</h3>
                    {privateRepo &&
                        <div className={styles.block_icon}>
                            <TbLockFilled />
                        </div>
                    }
                </div>
                
                <p>{maxCharacters(description)}</p>
                
                <div className={styles.tags}>
                    {tags.slice(0, 3).map((tag, index) => (
                        <div key={index}>
                            <p>{tag}</p>
                        </div>
                    ))
                    }
                    {tags.length > 3 && <div><p>+{tags.length - 3}</p></div>}
                </div>
                
                <p className={styles.clickInfo}>Clique para ver mais detalhes</p>
            </div>
        </div>
    )
}