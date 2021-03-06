import base.LoggedInSpec

import pages.app.modal.EditSystemPermissionsModal
import pages.app.HomePage
import pages.app.OrganizationsPage
import pages.app.ValuedComponentsPage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the EditSystemPermissions modal page")
class EditSystemPermissionsSpec extends LoggedInSpec {
  @Unroll
  def "Start on Page #InitialPage, open modal: EditSystemPermissionsModal, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the #InitialPage and open the modal EditSystemPermissionsModal"
      to InitialPage
      page(EditSystemPermissionsModal)
      page.open()
    when: "I click on the #ClickLink"
      assert modalModule.isOpen()
      page."$ClickLink".click()
      assert modalModule.isClosed()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      InitialPage          | ClickLink || AssertPage
      HomePage             | "XBtn"    || HomePage
      OrganizationsPage    | "XBtn"    || OrganizationsPage
      ValuedComponentsPage | "XBtn"    || ValuedComponentsPage
      //TODO could add every page, but is probably redundant
  }
}
