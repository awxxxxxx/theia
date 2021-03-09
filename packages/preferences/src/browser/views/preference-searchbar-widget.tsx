/********************************************************************************
 * Copyright (C) 2020 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, postConstruct } from 'inversify';
import { ReactWidget } from '@theia/core/lib/browser';
import * as React from 'react';
import { debounce } from 'lodash';
import { Disposable, Emitter } from '@theia/core';

@injectable()
export class PreferencesSearchbarWidget extends ReactWidget {
    static readonly ID = 'settings.header';
    static readonly LABEL = 'Settings Header';
    static readonly SEARCHBAR_ID = 'preference-searchbar';

    protected readonly onFilterStringChangedEmitter = new Emitter<string>();
    readonly onFilterChanged = this.onFilterStringChangedEmitter.event;

    protected searchbarRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
    protected resultsCount: number = 0;

    @postConstruct()
    protected init(): void {
        this.onRender.push(Disposable.create(() => this.focus()));
        this.id = PreferencesSearchbarWidget.ID;
        this.title.label = PreferencesSearchbarWidget.LABEL;
        this.update();
    }

    protected handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.search(e.target.value);
    };

    protected search = debounce((value: string) => {
        this.onFilterStringChangedEmitter.fire(value);
        this.update();
    }, 200);

    focus(): void {
        if (this.searchbarRef.current) {
            this.searchbarRef.current.focus();
        }
    }

    /**
     * Clears the search input and all search results.
     * @param e on-click mouse event.
     */
    protected clearSearchResults = (e: React.MouseEvent): void => {
        const search = document.getElementById(PreferencesSearchbarWidget.SEARCHBAR_ID) as HTMLInputElement;
        if (search) {
            search.value = '';
            this.search(search.value);
            this.update();
        }
    };

    /**
     * Renders all search bar options.
     */
    protected renderOptionContainer(): React.ReactNode {
        const resultsCount = this.renderResultsCountOption();
        const clearAllOption = this.renderClearAllOption();
        return <div className="option-buttons"> {resultsCount} {clearAllOption} </div>;
    }

    /**
     * Renders a badge displaying search results count.
     */
    protected renderResultsCountOption(): React.ReactNode {
        const resultsFound = `${this.resultsCount === 0 ? 'No' : this.resultsCount} ${this.resultsCount === 1 ? 'Setting Found' : 'Settings Found'}`;
        return this.searchTermExists() ?
            (<span
                className="results-found"
                title={resultsFound}>
                {resultsFound}
            </span>)
            : '';
    }

    /**
     * Renders a clear all button.
     */
    protected renderClearAllOption(): React.ReactNode {
        return <span
            className={`clear-all option ${(this.searchTermExists() ? 'enabled' : '')}`}
            title="Clear Search Results"
            onClick={this.clearSearchResults}
        />;
    }

    /**
     * Determines whether the search input currently has a value.
     * @returns true, if the search input currently has a value; false, otherwise.
     */
    protected searchTermExists(): boolean {
        return !!this.searchbarRef.current?.value;
    }

    render(): React.ReactNode {
        const optionContainer = this.renderOptionContainer();
        return (
            <div className='settings-header'>
                <div className="settings-search-container">
                    <input
                        type="text"
                        id={PreferencesSearchbarWidget.SEARCHBAR_ID}
                        spellCheck={false}
                        placeholder="Search Settings"
                        className="settings-search-input theia-input"
                        onChange={this.handleSearch}
                        ref={this.searchbarRef}
                    />
                    {optionContainer}
                </div>
            </div >
        );
    }

    /**
     * Updates the search result count.
     * @param count the result count.
     */
    updateResultsCount(count: number): void {
        this.resultsCount = count;
        this.update();
    }
}