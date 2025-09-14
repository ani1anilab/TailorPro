// Team management module
const Team = {
    currentTeam: [],

    init() {
        this.loadTeam();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('addTeamMemberBtn').addEventListener('click', () => this.showTeamMemberModal());
        document.getElementById('teamMemberForm').addEventListener('submit', (e) => this.handleTeamMemberSubmit(e));
        document.getElementById('cancelTeamMember').addEventListener('click', () => this.hideTeamMemberModal());

        // Modal close
        const closeBtn = document.querySelector('#teamMemberModal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideTeamMemberModal());
        }
    },

    loadTeam() {
        const data = Storage.getAllData();
        this.currentTeam = data.teamMembers || [];
        this.renderTeam();
    },

    renderTeam() {
        const container = document.getElementById('teamMembersList');
        
        if (this.currentTeam.length === 0) {
            container.innerHTML = `
                <div class="team-empty-state">
                    <i class="fas fa-users"></i>
                    <h4>No team members found</h4>
                    <p>Add team members to manage assignments</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentTeam.map(member => `
            <div class="team-member-card">
                <div class="team-member-header">
                    <div>
                        <div class="team-member-name">${member.name}</div>
                        <div class="team-member-role">${member.role}</div>
                    </div>
                    ${member.isDefault ? '<span class="team-member-default">Default</span>' : ''}
                </div>
                <div class="team-member-info">
                    ${member.phone ? `<p><i class="fas fa-phone"></i> ${member.phone}</p>` : ''}
                    ${member.email ? `<p><i class="fas fa-envelope"></i> ${member.email}</p>` : ''}
                </div>
                <div class="team-member-actions">
                    <button class="btn btn-sm btn-secondary" onclick="Team.editTeamMember(${member.id})">
                        <i class="fas fa-edit"></i> <span class="action-text">Edit</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Team.deleteTeamMember(${member.id})">
                        <i class="fas fa-trash"></i> <span class="action-text">Delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    },

    showTeamMemberModal(member = null) {
        const modal = document.getElementById('teamMemberModal');
        const form = document.getElementById('teamMemberForm');

        if (member) {
            document.getElementById('teamMemberId').value = member.id;
            document.getElementById('teamMemberName').value = member.name;
            document.getElementById('teamMemberRole').value = member.role;
            document.getElementById('teamMemberPhone').value = member.phone || '';
            document.getElementById('teamMemberEmail').value = member.email || '';
        } else {
            form.reset();
            document.getElementById('teamMemberId').value = '';
        }

        // Update modal title
        const modalTitle = modal.querySelector('h3');
        if (modalTitle) {
            modalTitle.setAttribute('data-translate', member ? 'edit_team_member' : 'add_team_member');
        }

        modal.style.display = 'block';
    },

    hideTeamMemberModal() {
        document.getElementById('teamMemberModal').style.display = 'none';
    },

    handleTeamMemberSubmit(e) {
        e.preventDefault();

        const teamMemberData = {
            name: document.getElementById('teamMemberName').value,
            role: document.getElementById('teamMemberRole').value,
            phone: document.getElementById('teamMemberPhone').value || null,
            email: document.getElementById('teamMemberEmail').value || null
        };

        const teamMemberId = document.getElementById('teamMemberId').value;

        if (teamMemberId) {
            // Update existing team member
            const data = Storage.getAllData();
            const memberIndex = data.teamMembers.findIndex(m => m.id === parseInt(teamMemberId));
            if (memberIndex !== -1) {
                data.teamMembers[memberIndex] = { ...data.teamMembers[memberIndex], ...teamMemberData };
                Storage.saveAllData(data);
            }
        } else {
            // Add new team member
            const data = Storage.getAllData();
            teamMemberData.id = data.nextTeamMemberId || 1;
            data.nextTeamMemberId = (data.nextTeamMemberId || 1) + 1;
            data.teamMembers = data.teamMembers || [];
            data.teamMembers.push(teamMemberData);
            Storage.saveAllData(data);
        }

        this.loadTeam();
        this.hideTeamMemberModal();
        
        // Update order team member dropdowns if Orders module is loaded
        if (typeof Orders !== 'undefined') {
            Orders.populateTeamMemberSelects();
        }
    },

    editTeamMember(id) {
        const member = this.currentTeam.find(m => m.id === id);
        if (member) {
            this.showTeamMemberModal(member);
        }
    },

    deleteTeamMember(id) {
        const member = this.currentTeam.find(m => m.id === id);
        if (!member) return;
        
        CustomPopup.show({
            icon: 'fas fa-trash',
            title: 'Delete Team Member',
            message: `Are you sure you want to delete "${member.name}"? This will not affect existing orders.`,
            confirmText: 'Delete',
            confirmClass: 'btn-danger',
            onConfirm: () => {
                const data = Storage.getAllData();
                data.teamMembers = data.teamMembers.filter(m => m.id !== id);
                Storage.saveAllData(data);
                this.loadTeam();
                
                // Update order team member dropdowns if Orders module is loaded
                if (typeof Orders !== 'undefined') {
                    Orders.populateTeamMemberSelects();
                }
            }
        });
    },

    getTeamMemberById(id) {
        return this.currentTeam.find(m => m.id === id);
    },

    populateTeamMemberSelects() {
        const selects = [
            document.getElementById('orderTeamMember')
        ];

        selects.forEach(select => {
            if (!select) return;
            
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Team Member (Optional)</option>';
            
            this.currentTeam.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.name} (${member.role})`;
                select.appendChild(option);
            });

            select.value = currentValue;
        });
    }
};

// Initialize Team module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Team.init();
});