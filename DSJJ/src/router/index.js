import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '@/pages/LoginPage'
import AddParticipantPage from '@/pages/AddParticipantPage'
import ParticipantsPage from '@/pages/ParticipantsPage'
import SettingsPage from '@/pages/SettingsPage'
import MailingListPage from '@/pages/MailingListPage'
import ParticipantPage from '@/pages/ParticipantPage'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LoginPage',
      component: LoginPage
    },
    {
      path: '/participants',
      name: 'ParticipantsPage',
      component: ParticipantsPage
    },
    {
      path: '/mailinglist',
      name: 'MailingListPage',
      component: MailingListPage
    },
    {
      path: '/addparticipant',
      name: 'AddParticipantPage',
      component: AddParticipantPage
    },
    {
      path: '/dojos',
      name: 'SettingsPage',
      component: SettingsPage
    }
    ,
    {
      path: '/participants/:id',
      name: 'ParticipantPage',
      component: ParticipantPage,
      props: true
    }
  ],
  linkActiveClass: "is-active",
})
