const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Escrow", () => {
    let buyer, seller
    let realEstate, escrow

    //create the following set up for each test
    beforeEach(async () => {
        //create dummy accounts for test
        ;[buyer, seller, inspector, lender] = await ethers.getSigners()

        //deploy realestate
        const RealEstate = await ethers.getContractFactory("RealEstate")
        realEstate = await RealEstate.deploy()

        //mint
        let transaction = await realEstate
            .connect(seller)
            .mint(
                "https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json"
            )
        await transaction.wait()

        //deploy escrow
        const Escrow = await ethers.getContractFactory("Escrow")
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        //approve property
        transaction = await realEstate
            .connect(seller)
            .approve(escrow.address, 1)
        await transaction.wait()

        //list property
        transaction = await escrow
            .connect(seller)
            .list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait
    })

    describe("Deployment", () => {
        it("Returns NFT address", async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })
        it("Returns Seller", async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })
        it("Returns Inspector", async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })
        it("Returns Lender", async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })
    })

    describe("Listing", () => {
        it("Updates ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
        it("Updates as listed", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
        it("Returns buyer", async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })
        it("Returns purchase price", async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })
        it("Returns escrow amount", async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
    })
})
