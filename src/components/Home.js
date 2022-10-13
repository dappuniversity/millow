import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, escrow, togglePop }) => {
    const [isBuying, setIsBuying] = useState(false)
    const [owner, setOwner] = useState(null)

    const fetchOwner = async () => {
        if (isBuying) return
        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        setIsBuying(true)

        const escrowAmount = await escrow.escrowAmount(home.id)
        const buyer = await provider.getSigner()

        // Setup other Hardhat wallets for simulating inspection, lending, and selling...
        // NOTE: Never hardcode your private keys/mnemonics in your React application, these are
        // publicly provided by Hardhat!

        const inspector = new ethers.Wallet('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a', provider)
        const lender = new ethers.Wallet('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6', provider)
        const seller = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', provider)

        // Buyer deposit earnest
        let transaction = await escrow.connect(buyer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        // Inspector updates status
        transaction = await escrow.connect(inspector).updateInspectionStatus(home.id, true)
        await transaction.wait()

        // Lender approves...
        transaction = await escrow.connect(lender).approveSale(home.id)
        await transaction.wait()

        // Lender sends funds to contract...
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await lender.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        // Seller approves...
        transaction = await escrow.connect(seller).approveSale(home.id)
        await transaction.wait()

        // Buyer approves...
        transaction = await escrow.connect(buyer).approveSale(home.id)
        await transaction.wait()

        // Seller finalize...
        transaction = await escrow.connect(seller).finalizeSale(home.id)
        await transaction.wait()

        setIsBuying(false)
    }

    useEffect(() => {
        fetchOwner()
    }, [isBuying])

    return (
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            <button className='home__buy' onClick={buyHandler}>
                                Buy
                            </button>

                            <button className='home__contact'>
                                Contact agent
                            </button>
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Home;