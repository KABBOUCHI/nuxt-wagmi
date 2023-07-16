<script setup lang="ts">
const { connected, connectors, connect, disconnect, account, chainId, walletClient } = useWagmi()


const sendTx = async () => {
  await walletClient.value!.sendTransaction({
    to: account.value,
    value: 0n,
  })
}
</script>

<template>
  <UContainer class="p-4">
    <UCard>

      <UButton v-if="connected" @click="disconnect()" color="red">
        Disconnect
      </UButton>

      <div v-else class="space-y-4">
        <div v-for="connector in  connectors" class="flex items-center gap-4">
          {{ connector.name }}

          <UButton @click="connect(connector)">
            Connect
          </UButton>
        </div>
      </div>

      <div v-if="connected" class="mt-4">
        <UButton  @click="sendTx">Send Empty Tx</UButton>
      </div>


      <pre class="p-1 mt-5">{{ {
        account,
        chainId,
        connected,
      } }}</pre>
    </UCard>
  </UContainer>
</template>
