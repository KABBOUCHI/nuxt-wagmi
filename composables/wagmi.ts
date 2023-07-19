import { configureChains, createConfig, InjectedConnector, disconnect, watchAccount, getAccount, watchNetwork, getNetwork, getPublicClient, getWalletClient, PublicClient, WalletClient, Address, switchNetwork, connect } from '@wagmi/core'
import { mainnet, polygon, optimism, avalanche, arbitrum, fantom, bsc, aurora, gnosis, polygonZkEvm } from '@wagmi/core/chains'
import { publicProvider } from '@wagmi/core/providers/public'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { LedgerConnector } from '@wagmi/connectors/ledger'

const { chains, publicClient } = configureChains(
    [mainnet, polygon, optimism, avalanche, arbitrum, fantom, bsc, aurora, gnosis, polygonZkEvm],
    [publicProvider()],
)

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
        new InjectedConnector({
            chains, options: {
                shimDisconnect: true
            }
        }),
        new WalletConnectConnector({
            chains,
            options: {
                projectId: '42e9e3b646c9102371bd147b3e960c39'
            },
        }),
        new CoinbaseWalletConnector({
            chains,
            options: {
                appName: 'Wagmi',
            }
        }),
        new LedgerConnector({
            chains,
            options: {
                projectId: '42e9e3b646c9102371bd147b3e960c39'
            }
        }),
    ],
    publicClient,
})


const account = ref<Address>()
const connected = computed(() => !!account.value)
const isConnecting = ref(false)
const pendingConnector = shallowRef<typeof wagmiConfig.connectors[number]>()
const chainId = ref<number | null>()
const client = shallowRef<PublicClient | null>()
const walletClient = shallowRef<WalletClient | null>()

const reloadState = async () => {
    account.value = getAccount().address
    client.value = getPublicClient()
    chainId.value = getNetwork().chain?.id

    client.value = getPublicClient()
    walletClient.value = await getWalletClient({
        chainId: chainId.value || 1
    })
}

export const useWagmi = () => {
    onMounted(() => {
        const handlers: any[] = [
            watchAccount(reloadState),
            watchNetwork(reloadState),
        ]

        return () => {
            for (const handler of handlers) {
                handler()
            }
        }
    })

    return {
        connected,

        isConnecting,

        pendingConnector,

        account,

        chainId,

        client,

        walletClient,

        connectors: wagmiConfig.connectors,

        disconnect: async () => {
            await disconnect();

            account.value = undefined
            chainId.value = undefined
            isConnecting.value = false
            pendingConnector.value = undefined
            walletClient.value = null
            client.value = null
        },

        connect: async (connector: typeof wagmiConfig.connectors[number], chainId: number | undefined = undefined) => {
            pendingConnector.value = connector
            isConnecting.value = true

            try {
                await disconnect();

                await connect({
                    connector,
                    chainId
                })

                await reloadState()
            } finally {
                isConnecting.value = false
                pendingConnector.value = undefined
            }
        },

        switchNetwork: async (chainId: number) => {
            await switchNetwork({
                chainId
            })
        },
    }
}