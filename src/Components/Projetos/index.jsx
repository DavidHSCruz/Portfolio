import Card from 'Components/Card'
import styles from './Projetos.module.css'
import { useEffect, useState } from 'react'
import { getProjetos } from 'services/github'
import { BarLoader } from 'react-spinners'

const Projetos = ({title}) => {
    const [projetos, setProjetos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getRepositories() {
            const projetos = await getProjetos()
            if(projetos.length === 0) return
            
            setProjetos(projetos)
            setLoading(false)
        }

        getRepositories()
    }, [])

    return(
        <section className={styles.cards_container}>
            <h1 style={{paddingBottom: !loading && '4em'}}>{title}</h1>

            {loading ?
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <BarLoader color="var(--cor-verde-hover)" width={150} />
                </div>
            :
                <div className={styles.cards_component}>
                    {projetos.filter(repo => repo.name && repo.tags.length !== 0).map(repo => 
                        <Card
                            key={repo.id}
                            title={repo.name}
                            description={repo.description}
                            img={!repo.private ? repo.image : `/imagens/Projetos/${repo.name}.png`}
                            tags={repo.tags}
                            privateRepo={repo.private}
                            github={repo.url}
                            to={repo.homepage}
                            updated_at={repo.updated_at}
                        />
                    )}
                </div>
            }
        </section>
    )
}

export default Projetos
