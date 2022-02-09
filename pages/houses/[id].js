import houses from '../../houses.js'
import Head from 'next/head'
import Layout from '../../components/Layout'

export default function House(props) {
    const content = (
        <div>
          <Head>
            <title>{props.house.title}</title>
          </Head>
          <img src={props.house.picture} width="100%" alt="House picture" />
          <p>
            {props.house.type} - {props.house.town}
          </p>
          <p>{props.house.title}</p>
        </div>
      )
      
    return <Layout content={content} />
}

export async function getServerSideProps({ query }) {
    const { id } = query

    return { 
        props: {
            house: houses.filter((house) => house.id === parseInt(id))[0]
        } 
    }
}