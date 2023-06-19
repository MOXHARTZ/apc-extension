define(
  ['exports', 'apc/utils', 'apc/auxiliary', 'apc/configuration', 'apc/classes', 'apc/ui', 'apc/layout'],
  (exports, utils, auxiliary, { config }, classes, ui, layout) => {
    const { traceError, findOwnProperty, store } = auxiliary;

    try {
      // store.dev = true;
      // src/vs/platform/commands/common/commands.ts

      require(['vs/platform/files/common/fileService'], classes.fileService, traceError);
      require(['vs/base/browser/ui/grid/grid'], classes.grid, traceError);
      require(['vs/base/browser/ui/actionbar/actionbar'], classes.actionbar, traceError);
      require(['vs/base/browser/ui/menu/menu'], classes.menu, traceError);
      require(['vs/base/browser/ui/list/listView'], classes.listView, traceError);
      require(['vs/workbench/services/layout/browser/layoutService'], classes.layoutService, traceError);
      require(['vs/workbench/browser/workbench'], classes.workbench, traceError);
      require(['vs/workbench/browser/layout'], classes.layout, traceError);
      require(['vs/workbench/browser/parts/panel/panelPart'], classes.panelPart, traceError);
      require(['vs/workbench/browser/parts/editor/tabsTitleControl'], classes.tabsTitleControl, traceError);
      require(['vs/workbench/browser/parts/titlebar/menubarControl'], classes.menubarControl, traceError);
      require(['vs/workbench/browser/parts/statusbar/statusbarPart'], classes.statusbarPart, traceError);
      require(['vs/workbench/browser/parts/editor/editorPart'], classes.editorPart, traceError);
      require(['vs/workbench/browser/parts/sidebar/sidebarPart'], classes.sidebarPart, traceError);
      require(['vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart'], classes.auxiliaryBarPart, traceError);
      require(['vs/workbench/browser/parts/compositeBar'], classes.compositeBar, traceError);
      require(['vs/workbench/browser/parts/activitybar/activitybarPart'], classes.activitybarPart, traceError);
      require(['vs/workbench/contrib/files/browser/views/openEditorsView'], classes.openEditorsView, traceError);
      if (store.dev) {
        require(['vs/base/browser/ui/menu/menubar'], classes.menubar, traceError);
      }

      class Patch {
        constructor(nativeHostService, configurationService) {
          store.nativeHostService = nativeHostService; // relaunch, reload, openDevTools, clipboard, msgbox,
          store.configurationService = configurationService;
          if (store.isMacintosh && config.getConfiguration('apc.menubar.compact')) {
            try { require(['vs/platform/window/common/window'], classes.window, traceError); }
            catch (error) { traceError(error); }
          }
        }
      }

      exports.run = (instantiationService) => {
        try {
          const [, INativeHostServiceClass] = findOwnProperty(require('vs/platform/native/common/native'), 'INativeHostService', 'toString'); // the only one
          const [, IConfigurationService] = findOwnProperty(require('vs/platform/configuration/common/configuration'), 'IConfigurationService', 'toString'); // len 3, toString

          instantiationService.createInstance(utils.decorate([utils.param(0, INativeHostServiceClass), utils.param(1, IConfigurationService)], Patch));

          ui.run();

          config.addDisposable(config.onDidChangeConfiguration(e => {
            if (!store.initialised) { return store.initialised = true; }

            e.affectsConfiguration('workbench.sideBar.location') && layout.onChangeSideBarPosition();
            e.affectsConfiguration('apc.statusBar') && layout.updateStatusBar();
            e.affectsConfiguration('apc.activityBar') && layout.updateActivityBar();
            e.affectsConfiguration('apc.imports') && ui.appendFiles();
            e.affectsConfiguration('apc.stylesheet') && ui.appendStyles();

            Array.from(e.affectedKeys.values()).find(key => key.startsWith('apc.')) && ui.updateClasses();
          }));

        } catch (error) { traceError(error); }
      };
    } catch (error) { traceError(error); }

  });
