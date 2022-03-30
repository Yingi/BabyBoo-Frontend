import styled from 'styled-components';
import { NFTCard, NftPhoto } from "./components/NFTCard";
import { useState, useEffect } from "react";
import { NFTModal } from './components/NFTModal';
import { ethers } from 'ethers';
import { connect } from './helpers';

const axios = require('axios')
const abi = require("./abis/BabyBooCollection.json");

function App() {

  let initialNFT = [
    { name: "Marvel", symbol: "MVHH", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "Batman", symbol: "BAT", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "SpiderMan", symbol: "SM", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "Will", symbol: "WM", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "Panther", symbol: "BP", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "SuperMan", symbol: "SMC", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "Kong", symbol: "KG", copies: 10, image: "https://via.placeholder.com/150" },
    { name: "AntMan", symbol: "AM", copies: 10, image: "https://via.placeholder.com/150" },
  ]

  const [showModal, setShowModal] = useState(false)
  const [selectedNft, setSelectedNft] = useState()
  const [nft, setNfts] = useState(initialNFT)


  useEffect( () => {

    ( async () => {
      const address = await connect()
      if (address) {
        console.log(address)
        getNfts(address)
      }
    })()

  }, [])

  

  function toggleModal(i) {
    if (i >= 0) {
      setSelectedNft(nft[i])
    }
    setShowModal(!showModal)
  }

  async function getMetadataFromIpfs(tokenUri){
    let metadata = await axios.get(tokenUri)
    return metadata.data
  }

  async function getNfts(address) {
      const rpc = 'https://polygon-rpc.com/' //You can use Alchemy
      const ethersProvider = new ethers.providers.JsonRpcProvider(rpc)
      
      let nftCollection = new ethers.Contract("0x6BB89a46A334B17dD47dd55A4E79B33Df9B4b30b", abi.abi, ethersProvider)

      
      

      let numOfNFT = (await nftCollection.tokenCount()).toNumber()
      let nftSymbol = await nftCollection.symbol()

      
      let accounts = Array(numOfNFT).fill(address)
      
      let ids = Array.from({length: numOfNFT}, (_, i) => i + 1)

      let copies = await nftCollection.balanceOfBatch(accounts, ids)

      let tempArray = []
      let baseUri = ""

      for (let i =1; i <= numOfNFT; i++){
        if (i == 1){
          let tokenUri = await nftCollection.uri(i)
          
          baseUri = tokenUri.replace(/\d+.json/, "")
          
          let metadata = await getMetadataFromIpfs(tokenUri)
          metadata.symbol = nftSymbol
          metadata.copies = copies[i - 1]
          tempArray.push(metadata)
        }
        else {
          
          let metadata = await getMetadataFromIpfs(baseUri + `${i}.json`)
          metadata.symbol = nftSymbol
          metadata.copies = copies[i - 1]
          tempArray.push(metadata)
        }
      }

     setNfts(tempArray)
  }

  return (
    <div className="App">
      <Container>
        <Title>Collection </Title>
        <Subtitle>Initial NFT Layout</Subtitle>
        <Grid>
          {
            nft.map((nft, i) =>
            <NFTCard nft={nft} key={i} toggleModal={ () => toggleModal(i) }/>
            )
          }
        </Grid>
      </Container>
      {
        showModal &&
        <NFTModal 
          nft={selectedNft}
          toggleModal={ () => toggleModal() }
        />
      }
    </div>
  );
}



const Title = styled.h1`
  margin: 0;
  text-align: center;
`
const Subtitle = styled.h4`
  color: gray;
  margin-top: 0;
  text-align: center;
`
const Container = styled.div`
  width: 70%;
  max-width: 1200px;
  margin: auto;
  margin-top: 100px;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  row-gap: 40px;
  @media(max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media(max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media(max-width: 600px) {
    grid-template-columns: 1fr;
  }
  `


export default App;