import * as React from 'react';
import {
  Button as AppBridgeButton,
  TitleBar as AppBridgeTitleBar,
} from '@shopify/app-bridge/actions';
import {shallowWithAppProvider, mountWithAppProvider} from 'test-utilities';
import {Page, Card} from 'components';
import {LinkAction} from '../../../types';
import {Header} from '../components';
// eslint-disable-next-line shopify/strict-component-boundaries
import {SecondaryAction, PrimaryActionProps} from '../components/Header/Header';
// eslint-disable-next-line shopify/strict-component-boundaries
import {ActionGroupDescriptor} from '../components/Header/components';

jest.mock('../../../utilities/app-bridge-transformers', () => ({
  ...require.requireActual('../../../utilities/app-bridge-transformers'),
  generateRedirect: jest.fn((...args) => args),
  transformActions: jest.fn((...args) => args),
}));

const mockProps = {
  title: 'Test',
};

describe('<Page />', () => {
  function mockTitleBarCreate() {
    const titleBarMock = {
      set: jest.fn(),
      unsubscribe: jest.fn(),
    };

    const createSpy = jest.fn().mockReturnValue(titleBarMock);
    AppBridgeTitleBar.create = createSpy;

    return {
      createSpy,
      titleBarMock,
      restore() {
        (AppBridgeTitleBar.create as jest.Mock).mockRestore();
      },
    };
  }

  describe('forceRender renders children in page', () => {
    const {
      createSpy: titleBarCreateSpy,
      restore: restoreTitleBarCreateMock,
    } = mockTitleBarCreate();
    const {page} = mountWithAppBridge(
      <Page {...mockProps} title="new title" forceRender />,
    );

    expect(page.find(Header).exists()).toBeTruthy();
    expect(titleBarCreateSpy).not.toHaveBeenCalled();
    restoreTitleBarCreateMock();
  });

  describe('children', () => {
    it('renders its children', () => {
      const card = <Card />;
      const page = mountWithAppProvider(<Page {...mockProps}>{card}</Page>);
      expect(page.contains(card)).toBeTruthy();
    });
  });

  describe('title', () => {
    it('renders a <Header /> when defined', () => {
      const title = 'Products';
      const page = mountWithAppProvider(<Page {...mockProps} title={title} />);
      expect(page.find(Header).exists()).toBeTruthy();
    });

    it('gets passed into the <Header />', () => {
      const title = 'Products';
      const page = mountWithAppProvider(<Page {...mockProps} title={title} />);
      expect(page.find(Header).prop('title')).toBe(title);
    });
  });

  describe('primaryAction', () => {
    it('renders a <Header /> when defined', () => {
      const primaryAction = {
        content: 'Save',
      };
      const page = mountWithAppProvider(
        <Page {...mockProps} primaryAction={primaryAction} />,
      );
      expect(page.find(Header).exists()).toBeTruthy();
    });

    it('gets passed into the <Header />', () => {
      const primaryAction = {
        content: 'Save',
      };
      const page = mountWithAppProvider(
        <Page {...mockProps} primaryAction={primaryAction} />,
      );
      expect(page.find(Header).prop('primaryAction')).toBe(primaryAction);
    });
  });

  describe('secondaryActions', () => {
    it('renders a <Header /> when defined', () => {
      const secondaryActions = [
        {
          content: 'Preview',
        },
      ];
      const page = mountWithAppProvider(
        <Page {...mockProps} secondaryActions={secondaryActions} />,
      );
      expect(page.find(Header).exists()).toBeTruthy();
    });

    it('gets passed into the <Header />', () => {
      const secondaryActions = [
        {
          content: 'Preview',
        },
      ];
      const page = mountWithAppProvider(
        <Page {...mockProps} secondaryActions={secondaryActions} />,
      );
      expect(page.find(Header).prop('secondaryActions')).toBe(secondaryActions);
    });
  });

  describe('actionGroups', () => {
    it('renders a <Header /> when defined', () => {
      const actionGroups = [
        {
          title: 'Preview',
          actions: [
            {
              content: 'URL',
            },
          ],
        },
      ];
      const page = mountWithAppProvider(
        <Page {...mockProps} actionGroups={actionGroups} />,
      );
      expect(page.find(Header).exists()).toBeTruthy();
    });

    it('gets passed into the <Header />', () => {
      const actionGroups = [
        {
          title: 'Preview',
          actions: [
            {
              content: 'URL',
            },
          ],
        },
      ];
      const page = mountWithAppProvider(
        <Page {...mockProps} actionGroups={actionGroups} />,
      );
      expect(page.find(Header).prop('actionGroups')).toBe(actionGroups);
    });
  });

  describe('breadcrumbs', () => {
    function mockButtonCreate() {
      const buttonMock: any = {
        set: jest.fn(),
        subscribe: jest.fn(),
      };

      const {restore: restoreTitleBarCreateMock} = mockTitleBarCreate();
      jest.spyOn(AppBridgeButton, 'create').mockReturnValue(buttonMock);

      return {
        buttonMock,
        restore() {
          (AppBridgeButton.create as jest.Mock).mockRestore();
          restoreTitleBarCreateMock();
        },
      };
    }

    it('renders a <Header /> when defined', () => {
      const breadcrumbs = [
        {
          content: 'Products',
          onAction: noop,
        },
      ];
      const page = mountWithAppProvider(
        <Page {...mockProps} breadcrumbs={breadcrumbs} />,
      );
      expect(page.find(Header).exists()).toBeTruthy();
    });

    it('gets passed into the <Header />', () => {
      const breadcrumbs = [
        {
          content: 'Products',
          onAction: noop,
        },
      ];
      const page = mountWithAppProvider(
        <Page {...mockProps} breadcrumbs={breadcrumbs} />,
      );
      expect(page.find(Header).prop('breadcrumbs')).toStrictEqual(breadcrumbs);
    });

    it('subscribes a redirect callback for breadcrumbs', () => {
      const breadcrumb: LinkAction = {
        content: 'Products',
        url: 'https://www.google.com',
        target: 'REMOTE',
      };

      const {buttonMock, restore: restoreButtonCreateMock} = mockButtonCreate();
      const {
        polaris: {appBridge},
      } = mountWithAppBridge(<Page title="Test" breadcrumbs={[breadcrumb]} />);

      expect(buttonMock.subscribe).toHaveBeenCalledTimes(1);
      expect(buttonMock.subscribe).toHaveBeenCalledWith(
        AppBridgeButton.Action.CLICK,
        [appBridge, breadcrumb.url, breadcrumb.target],
      );

      restoreButtonCreateMock();
    });

    it('subscribes an action callback for breadcrumbs', () => {
      const {buttonMock, restore: restoreButtonCreateMock} = mockButtonCreate();
      const onActionSpy = jest.fn();

      mountWithAppBridge(
        <Page
          title="Test"
          breadcrumbs={[
            {
              onAction: onActionSpy,
            },
          ]}
        />,
      );

      expect(buttonMock.subscribe).toHaveBeenCalledTimes(1);
      expect(buttonMock.subscribe).toHaveBeenCalledWith(
        AppBridgeButton.Action.CLICK,
        onActionSpy,
      );

      restoreButtonCreateMock();
    });
  });

  describe('<Header />', () => {
    it('is not rendered when there is no header content', () => {
      const page = shallowWithAppProvider(<Page title="" />);
      expect(page.find(Header).exists()).toBeFalsy();
    });
  });

  describe('<TitleBar />', () => {
    it('creates a title bar on mount', () => {
      const {
        createSpy: titleBarCreateSpy,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();
      mountWithAppBridge(<Page title="Test" />);
      expect(titleBarCreateSpy).toHaveBeenCalledTimes(1);
      restoreTitleBarCreateMock();
    });

    it('receives neccesary transformed props', () => {
      const primaryAction: PrimaryActionProps = {
        content: 'Foo',
        url: '/foo',
        target: 'APP',
      };

      const secondaryActions: SecondaryAction[] = [
        {content: 'Bar', url: '/bar', target: 'ADMIN_PATH'},
      ];

      const actionGroups: ActionGroupDescriptor[] = [
        {
          title: 'Baz',
          actions: [{content: 'Qux', url: 'https://qux.com', target: 'REMOTE'}],
        },
      ];

      const {
        createSpy: titleBarCreateSpy,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();

      const {
        polaris: {appBridge},
      } = mountWithAppBridge(
        <Page
          title="Test"
          primaryAction={primaryAction}
          secondaryActions={secondaryActions}
          actionGroups={actionGroups}
        />,
      );

      expect(titleBarCreateSpy).toHaveBeenCalledTimes(1);
      expect(titleBarCreateSpy).toHaveBeenCalledWith(appBridge, {
        title: 'Test',
        buttons: [
          appBridge,
          {
            primaryAction,
            secondaryActions,
            actionGroups,
          },
        ],
        breadcrumbs: undefined,
      });

      restoreTitleBarCreateMock();
    });

    it('does not create a title bar on mount when there is no app bridge', () => {
      const {
        createSpy: titleBarCreateSpy,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();
      mountWithAppProvider(<Page title="Title" />);
      expect(titleBarCreateSpy).not.toHaveBeenCalled();
      restoreTitleBarCreateMock();
    });

    it('updates when props change', () => {
      const {
        titleBarMock,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();
      const {page} = mountWithAppBridge(<Page title="Title" />);

      page.setProps({title: 'Title'});
      expect(titleBarMock.set).toHaveBeenCalledTimes(0);

      page.setProps({title: 'New Title'});
      expect(titleBarMock.set).toHaveBeenCalledTimes(1);

      restoreTitleBarCreateMock();
    });

    it('does not call set when there is no app bridge', () => {
      const {
        titleBarMock,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();
      const page = mountWithAppProvider(<Page title="Title" />);

      page.setProps({title: 'New Title'});
      expect(titleBarMock.set).toHaveBeenCalledTimes(0);
      restoreTitleBarCreateMock();
    });

    it('unsubscribes when unmounted', () => {
      const {
        titleBarMock,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();
      const {page} = mountWithAppBridge(<Page title="" />);

      page.unmount();
      expect(titleBarMock.unsubscribe).toHaveBeenCalledTimes(1);
      restoreTitleBarCreateMock();
    });

    it('does not unsubscribe when there is no app bridge', () => {
      const {
        titleBarMock,
        restore: restoreTitleBarCreateMock,
      } = mockTitleBarCreate();
      const page = mountWithAppProvider(<Page title="" />);

      page.unmount();
      expect(titleBarMock.unsubscribe).toHaveBeenCalledTimes(0);
      restoreTitleBarCreateMock();
    });
  });
});

function noop() {}

function mountWithAppBridge(element: React.ReactElement<any>) {
  const appBridge = {};
  const polaris = {appBridge};
  const page = mountWithAppProvider(element, {
    context: {polaris},
  });
  return {page, polaris};
}
