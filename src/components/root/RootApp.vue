<template>
  <div id="app" :class="{'root': true, [$route.name]: true}">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div class='poolsdropdown'>
        <button class='simplebutton'>☰</button>
        <div class='dropdown'>
<!--            <router-link :to="'/compound/' + ($route.path.split('/')[2] || '')  ">Compound</router-link>-->
            <router-link :to="'/test3/' + ($route.path.split('/')[2] || '')  ">Test Pool</router-link>
            <a href="https://waterfall.foundation/" target="_blank">About Protocol</a>
            <a href="https://waterfall.foundation/uniswap/" target="_blank">Manual</a>

          <p>____________</p>
            <button class='simplebutton' @click = 'changeWallets'>Change wallet</button>
<!--            <button id='changeAccounts' class='simplebutton' -->
<!--              @click = 'changeAccounts'>Change accounts</button>-->
        </div>
      </div>

      <router-link to="/">Home</router-link>
       <!--      <div class='poolsdropdown'>-->
<!--        <router-link to="/combinedstats">Stats</router-link>-->
<!--        <div class='dropdown'>-->
<!--          <router-link to="/combinedstats">Stats</router-link>-->
<!--          <router-link to="/dailystats">Daily stats</router-link>-->
<!--          <router-link to="/volumepercoin">Coin volumes</router-link>-->
<!--          <router-link to="/volumeperpair">Pair volumes</router-link>-->
<!--          <router-link to="/totaldeposits">Total deposits</router-link>-->
<!--        </div>-->
<!--      </div>-->
<!--      <router-link to="/curvepay">Pay</router-link>-->
<!--      <router-link to="/risks">Risks</router-link>-->
<!--      <router-link to="/combinedstats" class='showmobile'>Stats</router-link>-->
<!--      <router-link to="/dailystats" class='showmobile'>Daily stats</router-link>-->
<!--      <router-link to="/volumepercoin" class='showmobile'>Coin volumes</router-link>-->
<!--      <router-link to="/volumeperpair" class='showmobile'>Pair volumes</router-link>-->
<!--      <router-link to="/totaldeposits" class='showmobile'>Total deposits</router-link>-->
<!--      <router-link to="/audits" class='showmobile'>Audits</router-link>-->
<!--      <router-link to="/events" class='showmobile'>Events</router-link>-->
<!--      <router-link to="/bugbounty" class='showmobile'>Bug Bounty</router-link>-->
<!--      <router-link to="/rootfaq" class='showmobile'>FAQ</router-link>-->
<!--      <router-link to="/integrations" class='showmobile'>Integrations</router-link>-->
<!--      <router-link to="/donate" class='showmobile'>Donate</router-link>-->
<!--      <a href="https://twitter.com/CurveFinance" class='showmobile' rel='noopener noreferrer'>#Twitter</a>-->
<!--      <a href="https://t.me/curvefi" class='showmobile' rel='noopener noreferrer'>@Telegram</a>-->
<!--      <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB" class='showmobile' rel='noopener noreferrer'>Dune Analytics</a>-->
<!--      <a href="https://github.com/curvefi/curve-contract" class='showmobile'>git@</a>-->
<!--      <a href="https://github.com/pengiundev/curve-vue" class='showmobile'>git@UI</a>-->
      <button class='simplebutton showmobile' @click = 'changeWallets'>Change wallet</button>
    </div>
    <div id="screen">
        <div :class="'blue window ' + $route.name">
            <h1><img :src="logoSrc" alt="🌀 Curve"></h1>
        </div>
        <div class='info-message gentle-message window half-width gentle-message' v-if='hasConnectedWallet'>
          You haven't connected a wallet. <button @click='changeWallets'>Connect wallet</button>
        </div>
        <router-view/>
    </div>
    <footer>
      <a href="https://explorer.waterfall.network">Waterfall network explorer</a>
    </footer>
  </div>
</template>

<script>
  import { getters, contract as currentContract, changeContract, poolMenu } from '../../contract'
  import init, { onboard } from '../../init'

  export default {
    metaInfo: {
      title: 'Curve Waterfall Interface',
      meta: [
        {'property': 'og:title', 'content': 'curve.fi'},
        {'property': 'og:url', 'content': 'https://curve.fi'},
        {'property': 'og:type', 'content': 'website'},
        {'property': 'og:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
        {'property': 'og:image', 'content': '/curve.png'},
        {'name': 'twitter:card', 'content': 'summary_large_image'},
        {'name': 'twitter:title', 'content': 'curve.fi'},
        {'name': 'twitter:site', 'content': '@CurveFinance'},
        {'name': 'twitter:creator', 'content': '@CurveFinance'},
        {'name': 'twitter:description', 'content': 'Curve is an exchange liquidity pool on Ethereum designed for extremely efficient stablecoin trading'},
        {'name': 'twitter:url', 'content': 'https://curve.fi'},
        {'name': 'twitter:image', 'content': '/curve.png'},
      ]
    },
    components: {
      
    },
    computed: {
      ...getters,
      poolMenu() {
        return poolMenu;
      },
      publicPath() {
        return process.env.BASE_URL
      },
      logoSrc() {
        if(!currentContract.swapbtc) return this.publicPath + 'logo_optimized.png'
      },
      hasConnectedWallet() {
        return this.default_account == '0x0000000000000000000000000000000000000000' 
                && !['Donate', 'StatsDaily', 'Audits', 'Stats', 'Contracts', 'FAQ', 'RootFAQ'].includes(this.$route.name)
      },
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      },
      async changeWallets() {
        currentContract.default_account = ''
        onboard.walletReset()
        localStorage.removeItem('selectedWallet')
        currentContract.totalShare = 0
        let userSelectedWallet = await onboard.walletSelect();
        await onboard.walletCheck();
      },
      async changeAccounts() {
        return onboard.accountSelect()
      },
    },
  }
</script>

<style scoped>
  #changeAccounts {
    margin-top: 0.3em;
  }
  @media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
    .top-menu-bar > .poolsdropdown {
      display: none;
    }
    .blue.window.half-width, .info-message.window.half-width {
      width: 90%;
    }
  }
  h1 > img {
    height: 52.125px;
  }
</style>